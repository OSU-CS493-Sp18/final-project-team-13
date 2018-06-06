const router = module.exports = require('express').Router();

const { router: usersRouter} = require('./users');
const { router: genresRouter } = require('./genres');
const { router: playlistsRouter } = require('./playlists');
const { router: songsRouter } = require('./songs');

router.use('/users', usersRouter);
router.use('/genres', genresRouter);
router.use('/playlists', playlistsRouter);
router.use('/songs', songsRouter);


