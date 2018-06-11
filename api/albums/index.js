const router = require('express').Router();
const validation = require('../../lib/validation');

const albumSchema = {
  title: { required: true },
  artist: { required: true },
  genre: { required: true },
  year: { required: true }
};

// ROUTE: /albums
// PARAMS:
// QUERIES: 
router.get('/', (req, res) => {
    const mysqlPool = req.app.locals.mysqlPool;
    getAlbumsCount(mysqlPool)
        .then((count) => {
            return getAlbumsPage(parseInt(req.query.page) || 1, count, mysqlPool);
        })
        .then((albumsPageInfo) => {
            /*
            * Generate HATEOAS links for surrounding pages and then send response.
            */
            albumsPageInfo.links = {};
            let { links, pageNumber, totalPages } = albumsPageInfo;
            if (pageNumber < totalPages) {
                links.nextPage = `/albums?page=${pageNumber + 1}`;
                links.lastPage = `/albums?page=${totalPages}`;
            }
            if (pageNumber > 1) {
                links.prevPage = `/albums?page=${pageNumber - 1}`;
                links.firstPage = '/albums?page=1';
            }
            res.status(200).json(albumsPageInfo);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: "Error fetching albums list.  Please try again later."
        });
    });
});

function getAlbumsCount(mysqlPool) {
    return new Promise((resolve, reject) => {
      mysqlPool.query('SELECT COUNT(*) AS count FROM albums', function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].count);
        }
      });
    });
}

function getAlbumsPage(page, totalCount, mysqlPool) {
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
        'SELECT albums.id, name, genres.genre FROM albums JOIN genres ON albums.genre = genres.id ORDER BY id LIMIT ?,?',
        [offset, numPerPage],
        function (err, results) {
          if (err) {
            reject(err);
          } else {
            resolve({
              albums: results,
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

// ROUTE: /albums
// PARAMS:
// QUERIES: 
router.post('/', (req, res) => {
  const mysqlPool = req.app.locals.mysqlPool;
  if (validation.validateAgainstSchema(req.body, albumSchema)) {
    insertNewAlbum(req.body, mysqlPool)
      .then((id) => {
        res.status(201).json({
          id: id,
          links: {
            album: `/albums/${id}`
          }
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "Error inserting album into DB.  Please try again later."
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid album object."
    });
  }
});

function insertNewAlbum(album, mysqlPool) {
  return new Promise((resolve, reject) => {
    albumVals = validation.extractValidFields(album, albumSchema);
    album.id = null;
    mysqlPool.query(
      'INSERT INTO albums SET ?',
      albumVals,
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

// ROUTE: /albums/albumID
// PARAMS:
// QUERIES: 
router.get('/:albumID', (req, res) => {
  const mysqlPool = req.app.locals.mysqlPool;
  const albumID = parseInt(req.params.albumID);
  getAlbumByID(albumID, mysqlPool)
    .then((album) => {
      if (album) {
        res.status(200).json(album);
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to fetch album.  Please try again later."
      });
    });
});

function getAlbumByID(albumID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT albums.id, name, genres.genre FROM albums JOIN genres ON albums.genre = genres.id WHERE albums.id = ?', [albumID], function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  })
}

// ROUTE: /albums/albumID
// PARAMS:
// QUERIES: 
router.put('/:albumID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const albumID = parseInt(req.params.albumID);
  if (validation.validateAgainstSchema(req.body, albumSchema)) {
    replaceAlbumByID(albumID, req.body, mysqlPool)
      .then((updateSuccessful) => {
        if (updateSuccessful) {
          res.status(200).json({
            links: {
              album: `/albums/${albumID}`
            }
          });
        } else {
          next();
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "Unable to update specified album.  Please try again later."
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid album object"
    });
  }
});

function replaceAlbumByID(albumID, album, mysqlPool) {
  return new Promise((resolve, reject) => {
    album = validation.extractValidFields(album, albumSchema);
    mysqlPool.query('UPDATE albums SET ? WHERE id = ?', [album, albumID], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });
}

// ROUTE: /albums/albumID
// PARAMS:
// QUERIES: 
router.delete('/:albumID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const albumID = parseInt(req.params.albumID);
  deleteAlbumByID(albumID, mysqlPool)
    .then((deleteSuccessful) => {
      if (deleteSuccessful) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to delete album.  Please try again later."
      });
    });
});

function deleteAlbumByID(albumID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('DELETE FROM albums WHERE id = ?', [albumID], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });
}


exports.router = router;