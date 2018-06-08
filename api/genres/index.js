const router = require('express').Router();
const validation = require('../../lib/validation');

const genreSchema = {
  genre: { required: true }
};

router.get('/', (req, res) => {
    const mysqlPool = req.app.locals.mysqlPool;
    getGenreCount(mysqlPool)
        .then((count) => {
            return getGenreList(mysqlPool);
        })
        .then((genreList) => {
            res.status(200).json(genreList);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: "Error fetching grenre list.  Please try again later."
        });
    });
});

function getGenreCount(mysqlPool) {
    return new Promise((resolve, reject) => {
      mysqlPool.query('SELECT COUNT(*) AS count FROM genres', function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].count);
        }
      });
    });
}

function getGenreList(mysqlPool) {
    return new Promise((resolve, reject) => {

      mysqlPool.query(
        'SELECT * FROM genres',
        function (err, results) {
          if (err) {
            reject(err);
          } else {
            resolve({
              genres: results
            });
          }
        }
      );
    });
}

router.post('/', (req, res) => {
  const mysqlPool = req.app.locals.mysqlPool;
  if (validation.validateAgainstSchema(req.body, genreSchema)) {
    insertNewGenre(req.body, mysqlPool)
      .then((id) => {
        res.status(201).json({
          id: id,
          links: {
            genre: `/genre/${id}`
          }
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "Error inserting genre into DB.  Please try again later."
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid genre object."
    });
  }
});

function insertNewGenre(genre, mysqlPool) {
  return new Promise((resolve, reject) => {
    genreVals = validation.extractValidFields(genre, genreSchema);
    genre.id = null;
    mysqlPool.query(
      'INSERT INTO genres SET ?',
      genreVals,
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

router.get('/:genreID', (req, res) => {
  const mysqlPool = req.app.locals.mysqlPool;
  const genreID = parseInt(req.params.genreID);
  getGenreByID(genreID, mysqlPool)
    .then((genre) => {
      if (genre) {
        res.status(200).json(genre);
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to fetch genre.  Please try again later."
      });
    });
});

function getGenreByID(genreID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT genre FROM genres WHERE id = ?', [genreID], function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  })
}

router.put('/:genreID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const genreID = parseInt(req.params.genreID);
  if (validation.validateAgainstSchema(req.body, genreSchema)) {
    replaceGenreByID(genreID, req.body, mysqlPool)
      .then((updateSuccessful) => {
        if (updateSuccessful) {
          res.status(200).json({
            links: {
              genre: `/genre/${genreID}`
            }
          });
        } else {
          next();
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "Unable to update specified genre.  Please try again later."
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid genre object"
    });
  }
});

function replaceGenreByID(genreID, genre, mysqlPool) {
  return new Promise((resolve, reject) => {
    genre = validation.extractValidFields(genre, genreSchema);
    mysqlPool.query('UPDATE genres SET ? WHERE id = ?', [genre, genreID], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });
}

router.delete('/:genreID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const genreID = parseInt(req.params.genreID);
  deleteGenreByID(genreID, mysqlPool)
    .then((deleteSuccessful) => {
      if (deleteSuccessful) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to delete genre.  Please try again later."
      });
    });
});

function deleteGenreByID(genreID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('DELETE FROM genres WHERE id = ?', [genreID], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });
}

exports.router = router;