const router = require('express').Router();
const validation = require('../../lib/validation');

const { requireAuthentication } = require('../../lib/auth');

/*
 * Schema for playlist object.
 */
const playlistSchema = {
  id: { required: false },
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

function getPlaylistByID(playlistID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT * FROM playlists WHERE id = ?', [playlistID], function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  })
}

/* 
 * ROUTE: /:playlistID
 * PARAMS: req, res
 * QUERIES: select all playlists 
 */
router.get('/:playlistID', function (req, res) {
	const mysqlPool = req.app.locals.mysqlPool;
	const playlistID = parseInt(req.params.playlistID);
	getPlaylistByID(playlistID, mysqlPool)
		.then((playlist) => {
			if (playlist) {
				res.status(200).json(playlist);
			} else {
				next();
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: "Failed to fetch playlist."
			});
		});
});

/*
 * MySQL function to insert new playlist
 */
function insertNewPlaylist(playlist, mysqlPool) {
	return new Promise((resolve, reject) => {
		playlist = validation.extractValidFields(playlist, playlistSchema);
		playlist.id = null;
		mysqlPool.query(
			'INSERT INTO playlists SET ?',
			playlist,
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

/*
 * Route to create a new playlist.
 */
router.post('/:userID/playlists', requireAuthentication, (req, res) => {
  	const mysqlPool = req.app.locals.mysqlPool;
	if (req.user !== req.params.userID) {
		res.status(403).json({
			error: "Unauthorized to access that resource"
		});
	} else {
		req.body.userid = req.user;
		console.log(req.body);
		if (validation.validateAgainstSchema(req.body, playlistSchema)) {
			insertNewPlaylist(req.body, mysqlPool)
				.then((id) => {
					res.status(201).json({
						id: id,
					links: {
						playlist: `/playlists/${id}`
					}
				});
			})
			.catch((err) => {
				res.status(500).json({
					error: "Error inserting playlist into DB.  Please try again later."
				});
			});
		} else {
			res.status(400).json({
				error: "Request body is not a valid playlist object."
			});
		}
	}
});

/*
 * MySQL function to update a playlist
 */
function replacePlaylistByID(playlistID, playlist, mysqlPool) {
  return new Promise((resolve, reject) => {
    playlist = validation.extractValidFields(playlist, playlistSchema);
    mysqlPool.query('UPDATE playlists SET ? WHERE id = ?', [ playlist, playlistID ], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });
}

/*
 * Route to update a playlist.
 */
router.put('/:userID/:playlistID', requireAuthentication, (req, res) => {
  	const mysqlPool = req.app.locals.mysqlPool;
	if (req.user !== req.params.userID) {
		res.status(403).json({
			error: "Unauthorized to access that resource"
		});
	} else {
		const playlistID = parseInt(req.params.playlistID);
		req.body.userid = req.user;
		if (validation.validateAgainstSchema(req.body, playlistSchema)) {
			replacePlaylistByID(playlistID, req.body, mysqlPool)
				.then((updateSuccessful) => {
					if (updateSuccessful) {
						res.status(200).json({
							links: {
								playlists: `/playlists/${playlistID}`
							}
						});
					} else {
						next();
					}
				})
				.catch((err) => {
					console.log(err);
					res.status(500).json({
						error: "Unable to update specified playlist.  Please try again later."
					});
				});
		} else {
			res.status(400).json({
				error: "Request body is not a valid playlist object"
			});
		}
	}
});

/*
 * MySQL function to delete a playlist
 */
function deletePlaylistByID(playlistID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('DELETE FROM playlists WHERE id = ?', [ playlistID ], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });

}

/*
 * Route to delete a playlist.
 */
router.delete('/:userID/:playlistID', requireAuthentication, (req, res) => {
  	const mysqlPool = req.app.locals.mysqlPool;
	if (req.user !== req.params.userID) {
		res.status(403).json({
			error: "Unauthorized to access that resource"
		});
	} else {
		const playlistID = parseInt(req.params.playlistID);
		deletePlaylistByID(playlistID, mysqlPool)
			.then((deleteSuccessful) => {
				if (deleteSuccessful) {
					res.status(204).end();
				} else {
					next();
				}
			})
			.catch((err) => {
				res.status(500).json({
					error: "Unable to delete playlist.  Please try again later."
				});
			});
	}
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

/*
 * Route to list all of a user's playlists.
 */
router.get('/:userID/playlists', requireAuthentication, (req, res) => {
	const mysqlPool = req.app.locals.mysqlPool;
	if (req.user !== req.params.userID) {
		res.status(403).json({
			error: "Unauthorized to access that resource"
		});
	} else {
		const userID = req.params.userID;
		getPlaylistsByOwnerID(userID, mysqlPool)
			.then((playlists) => {
				if (playlists) {
					res.status(200).json({ playlists: playlists });
				} else {
					next();
				}
			})
			.catch((err) => {
				res.status(500).json({
					error: "Unable to fetch playlists.  Please try again later."
				});
			});
	}
});

exports.router = router;