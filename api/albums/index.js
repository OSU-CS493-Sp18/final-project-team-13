const router = require('express').Router();
const validation = require('../../lib/validation');

const albumSchema = {
  title: { required: true },
  artist: { required: true },
  genre: { required: true },
  year: { required: true },
  streaming_sites: { required: true}
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
      mysqlPool.query('SELECT COUNT(*) AS count FROM streaming_sites_albums', function (err, results) {
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
        'SELECT albums.id, title, artist, year, genres.genre, streaming_sites.name AS streaming_site \
        FROM albums \
        JOIN genres ON albums.genre = genres.id \
        LEFT JOIN streaming_sites_albums ON albums.id = streaming_sites_albums.album_id \
        LEFT JOIN streaming_sites ON streaming_sites_albums.site_id = streaming_sites.id \
        ORDER BY albums.id LIMIT ?,?',
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
  var streaming_sites = req.body.streaming_sites;
  var albumId;
  if (validation.validateAgainstSchema(req.body, albumSchema)) {
    insertNewAlbum(req.body, mysqlPool)
      .then((id) => {
        albumId = id;
        for(var i = 0; i < streaming_sites.length; i++){
          insertNewAlbumStreams(id, streaming_sites[i], mysqlPool);
        }
        
      })
      .then(() => {
        res.status(201).json({
          id: albumId,
          links: {
            album: `/albums/${albumId}`
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
    delete album.streaming_sites;
    album = validation.extractValidFields(album, albumSchema);
    album.id = null;
    mysqlPool.query(
      'INSERT INTO albums SET ?',
      album,
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

function insertNewAlbumStreams(album_id, site_id, mysqlPool) {
    mysqlPool.query(
      'INSERT INTO streaming_sites_albums (site_id, album_id) VALUES (?,?)',
      [site_id, album_id],
      function (err, result) {
        if (err) {
          return(err);
        } else {
          console.log("site", site_id);
          console.log(result);
          return(album_id);
        }
      }
    );
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
      console.log(err);
      res.status(500).json({
        error: "Unable to fetch album.  Please try again later."
      });
    });
});

function getAlbumByID(albumID, mysqlPool) {

  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT albums.id, title, artist, year, genres.genre, streaming_sites.name AS streaming_site \
     FROM albums \
     JOIN genres ON albums.genre = genres.id \
     LEFT JOIN streaming_sites_albums ON albums.id = streaming_sites_albums.album_id \
     LEFT JOIN streaming_sites ON streaming_sites_albums.site_id = streaming_sites.id \
     WHERE albums.id = ?', [albumID], function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results);
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
  var streaming_sites = req.body.streaming_sites;
  if (validation.validateAgainstSchema(req.body, albumSchema)) {
    replaceAlbumByID(albumID, req.body, mysqlPool)
      .then((updateSuccessful) => {
        if (updateSuccessful) {
          removeAlbumStreamByID(albumID, mysqlPool);
          for(var i = 0; i < streaming_sites.length; i++){
            insertNewAlbumStreams(albumID, streaming_sites[i], mysqlPool);
          }
        }
        else {
          next();
        }
      })
      .then(() => {
          res.status(200).json({
            links: {
              album: `/albums/${albumID}`
            }
          });
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
    delete album.streaming_sites;
    mysqlPool.query('UPDATE albums SET ? WHERE id = ?', [album, albumID], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });
}

function removeAlbumStreamByID(albumId, mysqlPool) {
    mysqlPool.query(
      'DELETE FROM streaming_sites_albums WHERE album_id = ?',
      albumId,
      function (err, result) {
        if (err) {
          console.log(err);
          return(err);
        } else {
          return(result.affectedRows > 0);
        }
      }
    );
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