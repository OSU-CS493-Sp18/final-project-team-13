const router = module.exports = require('express').Router();

const { router: usersRouter} = require('./users');
const { router: genresRouter } = require('./genres');
const { router: playlistsRouter } = require('./playlists');

router.use('/users', usersRouter);
router.use('/genres', genresRouter);
router.use('/playlists', playlistsRouter);


