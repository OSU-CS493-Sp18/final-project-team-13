const router = require('express').Router();
const validation = require('../../lib/validation');

const artistSchema = {
  name: { required: true },
  genre: { required: true },
};

// ROUTE: /artists
// PARAMS:
// QUERIES: 
router.get('/', (req, res) => {
    const mysqlPool = req.app.locals.mysqlPool;
    getArtistsCount(mysqlPool)
        .then((count) => {
            return getArtistsPage(parseInt(req.query.page) || 1, count, mysqlPool);
        })
        .then((artistsPageInfo) => {
            /*
            * Generate HATEOAS links for surrounding pages and then send response.
            */
            artistsPageInfo.links = {};
            let { links, pageNumber, totalPages } = artistsPageInfo;
            if (pageNumber < totalPages) {
                links.nextPage = `/artists?page=${pageNumber + 1}`;
                links.lastPage = `/artists?page=${totalPages}`;
            }
            if (pageNumber > 1) {
                links.prevPage = `/artists?page=${pageNumber - 1}`;
                links.firstPage = '/artists?page=1';
            }
            res.status(200).json(artistsPageInfo);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: "Error fetching artists list.  Please try again later."
        });
    });
});

function getArtistsCount(mysqlPool) {
    return new Promise((resolve, reject) => {
      mysqlPool.query('SELECT COUNT(*) AS count FROM artists', function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].count);
        }
      });
    });
}

function getArtistsPage(page, totalCount, mysqlPool) {
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
        'SELECT artists.id, name, genres.genre FROM artists JOIN genres ON artists.genre = genres.id ORDER BY id LIMIT ?,?',
        [offset, numPerPage],
        function (err, results) {
          if (err) {
            reject(err);
          } else {
            resolve({
              artists: results,
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

// ROUTE: /artists
// PARAMS:
// QUERIES: 
router.post('/', (req, res) => {
  const mysqlPool = req.app.locals.mysqlPool;
  if (validation.validateAgainstSchema(req.body, artistSchema)) {
    insertNewArtist(req.body, mysqlPool)
      .then((id) => {
        res.status(201).json({
          id: id,
          links: {
            artist: `/artists/${id}`
          }
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "Error inserting artist into DB.  Please try again later."
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid artist object."
    });
  }
});

function insertNewArtist(artist, mysqlPool) {
  return new Promise((resolve, reject) => {
    artistVals = validation.extractValidFields(artist, artistSchema);
    artist.id = null;
    mysqlPool.query(
      'INSERT INTO artists SET ?',
      artistVals,
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

// ROUTE: /artists/artistID
// PARAMS:
// QUERIES: 
router.get('/:artistID', (req, res) => {
  const mysqlPool = req.app.locals.mysqlPool;
  const artistID = parseInt(req.params.artistID);
  getArtistByID(artistID, mysqlPool)
    .then((artist) => {
      if (artist) {
        res.status(200).json(artist);
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to fetch artist.  Please try again later."
      });
    });
});

function getArtistByID(artistID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT artists.id, name, genres.genre FROM artists JOIN genres ON artists.genre = genres.id WHERE artists.id = ?', [artistID], function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  })
}

// ROUTE: /artists/artistID
// PARAMS:
// QUERIES: 
router.put('/:artistID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const artistID = parseInt(req.params.artistID);
  if (validation.validateAgainstSchema(req.body, artistSchema)) {
    replaceArtistByID(artistID, req.body, mysqlPool)
      .then((updateSuccessful) => {
        if (updateSuccessful) {
          res.status(200).json({
            links: {
              artist: `/artists/${artistID}`
            }
          });
        } else {
          next();
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "Unable to update specified artist.  Please try again later."
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid artist object"
    });
  }
});

function replaceArtistByID(artistID, artist, mysqlPool) {
  return new Promise((resolve, reject) => {
    artist = validation.extractValidFields(artist, artistSchema);
    mysqlPool.query('UPDATE artists SET ? WHERE id = ?', [artist, artistID], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });
}

// ROUTE: /artists/artistID
// PARAMS:
// QUERIES: 
router.delete('/:artistID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const artistID = parseInt(req.params.artistID);
  deleteArtistByID(artistID, mysqlPool)
    .then((deleteSuccessful) => {
      if (deleteSuccessful) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to delete artist.  Please try again later."
      });
    });
});

function deleteArtistByID(artistID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('DELETE FROM artists WHERE id = ?', [artistID], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });
}


exports.router = router;