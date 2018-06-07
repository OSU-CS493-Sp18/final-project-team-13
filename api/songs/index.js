const router = require('express').Router();

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
        [ offset, numPerPage ],
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
  insertNewBusiness(req.body, mysqlPool)
    .then((id) => {
      res.status(201).json({
        id: id,
        links: {
          business: `/businesss/${id}`
        }
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: "Error inserting business into DB.  Please try again later."
      });
    });
});


// ROUTE: /songs/songID
// PARAMS:
// QUERIES: 
router.get('/:songID', (req, res) => {

});





exports.router = router;