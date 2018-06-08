const router = require('express').Router();
const validation = require('../../lib/validation');

/*
 * Schema for playlist object.
 */
const playlistSchema = {
  id: { required: true },
  name: { required: true },
  userid: { required: true }
};

/*
 * Function to find number of playlists objects in MySQL database.
 */
function getPlaylistCount(mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT COUNT(*) AS count FROM playlists', function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0].count);
      }
    });
  });
}

/*
 * Function that returns a single page of 10 playlist objects from the MySQL
 * the MySQL database.
 */
function getPlaylistsPage(page, totalCount, mysqlPool) {
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
      'SELECT * FROM playlists ORDER BY id LIMIT ?,?',
      [ offset, numPerPage ],
      function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve({
            playlists: results,
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

/* 
 * ROUTE: /playlists
 * PARAMS: req, res
 * QUERIES: select all playlists 
 */
router.get('/', function (req, res) {
  const mysqlPool = req.app.locals.mysqlPool;
  getPlaylistCount(mysqlPool)
    .then((count) => {
      return getPlaylistsPage(parseInt(req.query.page) || 1, count, mysqlPool);
    })
    .then((playlistsPageInfo) => {
      /*
       * Generate HATEOAS links for surrounding pages and then send response.
       */
      playlistsPageInfo.links = {};
      let { links, pageNumber, totalPages } = playlistsPageInfo;
      if (pageNumber < totalPages) {
        links.nextPage = `/playlists?page=${pageNumber + 1}`;
        links.lastPage = `/playlists?page=${totalPages}`;
      }
      if (pageNumber > 1) {
        links.prevPage = `/playlists?page=${pageNumber - 1}`;
        links.firstPage = '/playlists?page=1';
      }
      res.status(200).json(playlistsPageInfo);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: "Error fetching playlists list.  Please try again later."
      });
    });
});

/*
 * Function to fetch all the playlists owned by a specific user.
 */
function getPlaylistsByOwnerID(userID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM playlists WHERE userid = ?',
      [ userID ],
      function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}

exports.router = router;
exports.getPlaylistsByOwnerID = getPlaylistsByOwnerID;