const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const api = require('./api');
const app = express();
const port = process.env.PORT || 8000;

const MongoClient = require('mongodb').MongoClient;
const mongoHost = process.env.MONGO_HOST
const mongoDatabase = process.env.MONGO_DATABASE
const mongoUser = process.env.MONGO_USERNAME
const mongoPassword = process.env.MONGO_PASSWORD
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDatabase}`;

const maxMySQLConnections = 10;
app.locals.mysqlPool = mysql.createPool({
	connectionLimit: maxMySQLConnections,
	host: mysqlHost,
	port: mysqlPort,
	database: mysqlDBName,
	user: mysqlUser,
	password: mysqlPassword
});

app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(morgan('dev'));

app.use('/', api);

app.use('*', function(req, res, next){
    res.status(404).json({
        error: "Requested resource " + req.originalUrl + " does not exist"
    });
})

MongoClient.connect(mongoURL, {useNewUrlParser: true}, function (err, client) {
	if (!err) {
		app.locals.mongoDB = client.db(mongoDatabase);
		app.listen(port, function () {
			console.log("== Server is running on port", port);
		});
	}
})


