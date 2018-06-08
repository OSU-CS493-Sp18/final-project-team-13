const router = module.exports = require('express').Router();

const { router: usersRouter} = require('./users');
const { router: genresRouter } = require('./genres');
const { router: playlistsRouter } = require('./playlists');
const { router: songsRouter } = require('./songs');
const { router: artistsRouter } = require('./artists');

router.get('/users/:userID/:playlistID', function(req, res, next) {
	
	if(req.method === 'GET') {
		router.use('/:playlistID', playlistsRouter);
	}
	
	if(req.params.userID && req.params.playlistID ) {
		router.use('/users/:userID/:playlistID', playlistsRouter);
	}
	next();
});

router.use('/users', usersRouter);
router.use('/genres', genresRouter);
router.use('/playlists', playlistsRouter);
router.use('/songs', songsRouter);
router.use('/artists', artistsRouter);


