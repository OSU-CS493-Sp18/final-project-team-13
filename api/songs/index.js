const router = require('express').Router();
const validation = require('../../lib/validation');

const songSchema = {
  title: { required: true },
  artist: { required: true },
  album: { required: true },
};

// ROUTE: /songs
// PARAMS:
// QUERIES: 
router.get('/', (req, res) => {
    const mysqlPool = req.app.locals.mysqlPool;
    getSongsCount(mysqlPool)
        .then((count) => {
            return getSongsPage(parseInt(req.query.page) || 1, count, mysqlPool);
        })
        .then((songsPageInfo) => {
            /*
            * Generate HATEOAS links for surrounding pages and then send response.
            */
            songsPageInfo.links = {};
            let { links, pageNumber, totalPages } = songsPageInfo;
            if (pageNumber < totalPages) {
                links.nextPage = `/songs?page=${pageNumber + 1}`;
                links.lastPage = `/songs?page=${totalPages}`;
            }
            if (pageNumber > 1) {
                links.prevPage = `/songs?page=${pageNumber - 1}`;
                links.firstPage = '/songs?page=1';
            }
            res.status(200).json(songsPageInfo);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: "Error fetching songs list.  Please try again later."
        });
    });
});

function getSongsCount(mysqlPool) {
    return new Promise((resolve, reject) => {
      mysqlPool.query('SELECT COUNT(*) AS count FROM songs', function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].count);
        }
      });
    });
}

function getSongsPage(page, totalCount, mysqlPool) {
    return new Promise((resolve, reject) => {
      /*
       * Compute last page number and make sure page is within allowed bounds.
       * Compute offset into collection.
       */
      const numPerPage = 10;
      const lastPage = Math.max(Math.ceil(totalCount / numPerPage), 1);
      page = page < 1 ? 1 : page;
      page = page > lastPage ? lastPage : page;
      const offset = (page - 1) * numPerPage;

      mysqlPool.query(
        'SELECT * FROM songs ORDER BY id LIMIT ?,?',
        [offset, numPerPage],
        function (err, results) {
          if (err) {
            reject(err);
          } else {
            resolve({
              songs: results,
              pageNumber: page,
              totalPages: lastPage,
              pageSize: numPerPage,
              totalCount: totalCount
            });
          }
        }
      );
    });
}

// ROUTE: /songs
// PARAMS:
// QUERIES: 
router.post('/', (req, res) => {
  const mysqlPool = req.app.locals.mysqlPool;
  if (validation.validateAgainstSchema(req.body, songSchema)) {
    insertNewSong(req.body, mysqlPool)
      .then((id) => {
        res.status(201).json({
          id: id,
          links: {
            song: `/songs/${id}`
          }
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "Error inserting song into DB.  Please try again later."
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid song object."
    });
  }
});

function insertNewSong(song, mysqlPool) {
  return new Promise((resolve, reject) => {
    songVals = validation.extractValidFields(song, songSchema);
    song.id = null;
    mysqlPool.query(
      'INSERT INTO songs SET ?',
      songVals,
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result.insertId);
        }
      }
    );
  });
}

// ROUTE: /songs/songID
// PARAMS:
// QUERIES: 
router.get('/:songID', (req, res) => {
  const mysqlPool = req.app.locals.mysqlPool;
  const songID = parseInt(req.params.songID);
  getSongByID(songID, mysqlPool)
    .then((song) => {
      if (song) {
        res.status(200).json(song);
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to fetch song.  Please try again later."
      });
    });
});

function getSongByID(songID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT * FROM songs WHERE id = ?', [songID], function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  })
}

// ROUTE: /songs/songID
// PARAMS:
// QUERIES: 
router.put('/:songID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const songID = parseInt(req.params.songID);
  if (validation.validateAgainstSchema(req.body, songSchema)) {
    replaceSongByID(songID, req.body, mysqlPool)
      .then((updateSuccessful) => {
        if (updateSuccessful) {
          res.status(200).json({
            links: {
              song: `/songs/${songID}`
            }
          });
        } else {
          next();
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "Unable to update specified song.  Please try again later."
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid song object"
    });
  }
});

function replaceSongByID(songID, song, mysqlPool) {
  return new Promise((resolve, reject) => {
    song = validation.extractValidFields(song, songSchema);
    mysqlPool.query('UPDATE songs SET ? WHERE id = ?', [song, songID], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });
}

// ROUTE: /songs/songID
// PARAMS:
// QUERIES: 
router.delete('/:songID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const songID = parseInt(req.params.songID);
  deleteSongByID(songID, mysqlPool)
    .then((deleteSuccessful) => {
      if (deleteSuccessful) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to delete song.  Please try again later."
      });
    });
});

function deleteSongByID(songID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('DELETE FROM songs WHERE id = ?', [songID], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });
}


exports.router = router;