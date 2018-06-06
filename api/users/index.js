const router = require('express').Router();
const bcrypt =  require('bcryptjs');

const { generateAuthToken, requireAuthentication } = require('../lib/auth');

// ROUTE: /users
// PARAMS:
// QUERIES: 
router.post('/', function(req, res) {
	
});

// ROUTE: /users
// PARAMS:
// QUERIES: 
router.get('/', (req, res) => {

});


// ROUTE: /users/userID
// PARAMS:
// QUERIES: 
router.get('/:userID', (req, res) => {

});





exports.router = router;