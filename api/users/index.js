const router = require('express').Router();
const bcrypt = require('bcryptjs');

const { generateAuthToken, requireAuthentication } = require('../../lib/auth');

function validateUserObject(user, mongoDB) {

    return mongoDB.collection('users').findOne({ name: user.name })
        .then((result) => {
            return result ? false :
                Promise.resolve(user && user.userID && user.name && user.password)
        }
        )
        .catch((err) => console.log(err));
};

function insertNewUser(user, mongoDB) {

    return bcrypt.hash(user.password, 8)
        .then((passwordHash) => {
            const userDocument = {
                userID: user.userID,
                name: user.name,
                password: passwordHash,
                playlists: []
            };
            const usersCollection = mongoDB.collection('users');
            return usersCollection.insertOne(userDocument);
        })
        .then((result) => {
            return Promise.resolve(result.insertedId)
        })
}

//ROUTE: /users
//QUERY: page, 
//RETURNS: all users
router.get('/', (req, res) => {
    const mongoDB = req.app.locals.mongoDB;
    const projection = { password: 0 };
    mongoDB.collection('users').find({})
    .project(projection)
    .toArray()
        .then( (users) => {
            if (users){
                res.status(200).json(users);
            } else {
                res.status(500).json({
                    error: "Error fetching users."
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                error: "Error fetching users list. Please try again later."
            });
        });
    
});

router.post('/', (req, res) => {
    const mongoDB = req.app.locals.mongoDB;
    validateUserObject(req.body, mongoDB)
        .then((result) => {
            if (result) {
                insertNewUser(req.body, mongoDB)
                    .then((id) => {
                        res.status(201).json({
                            _id: id,
                            links: {
                                user: `users/${id}`
                            }
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({
                            error: "Failed to insert new user."
                        });
                    });
            } else {
                res.status(400).json({
                    error: "Request doesn't contain a valid user."
                })
            }
        })
});

router.post('/login', (req, res) => {
    const mongoDB = req.app.locals.mongoDB;
    let userToken;

    if (req.body && req.body.userID && req.body.password) {
        getUserByID(req.body.userID, mongoDB, true)
            .then((user) => {
                if (user) {
                    userToken = user.apiToken;
                    return bcrypt.compare(req.body.password, user.password);
                } else {
                    return Promise.reject(401);
                }
            })
            .then((loginSuccessful) => {
                if (loginSuccessful) {
                    return generateAuthToken(req.body.userID);
                } else {
                    return Promise.reject(401)
                }
            })
            .then((token) => {
                res.status(200).json({
                    token: token,
                });
            })
            .catch((err) => {
                if (err === 401) {
                    res.status(401).json({
                        error: "Invalid credentials.",
                        err: err
                    })
                } else {
                    res.status(500).json({
                        error: "Failed to fetch user.",
                        err: err
                    })
                }
            })
    } else {
        res.status(400).json({
            error: "Failed to fetch user."
        });
    }
});

function getUserByID(userID, mongoDB, includePassword) {
    const usersCollection = mongoDB.collection('users');
    const projection = includePassword ? {} : { password: 0 };
    return usersCollection
        .find({ userID: userID })
        .project(projection)
        .toArray()
        .then((results) => {
            return Promise.resolve(results[0]);
        });
}

router.get('/:userID', requireAuthentication, (req, res, next) => {
    const mongoDB = req.app.locals.mongoDB;
    if (req.user !== req.params.userID) {
        res.status(403).json({
            error: "Unauthorized to access that resource."
        });
    } else {
        getUserByID(req.params.userID, mongoDB)
            .then((user) => {
                if (user) {
                    res.status(200).json(user);
                } else {
                    next();
                }
            })
            .catch((err) => {
                res.status(500).json({
                    error: "Failed to fetch user."
                });
            });
    }
});

router.get('/:userID/playlists', requireAuthentication, (req, res) =>  {
    const mysqlPool = req.app.locals.mysqlPool;
    if (req.user !== req.params.userID) {
        res.status(403).json({
            error: "Unauthorized to access that resource."
        });
    } else {
        const userID = parseInt(req.params.userID);
        mysqlPool.query('SELECT * FROM playlists WHERE userID = ?', [userID])
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