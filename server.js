const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const api = require('./api');
const app = express();
const port = process.env.PORT || 8000;
const MongoClient = require('mongodb').MongoClient;

const { mongoConnect } = require('./lib/db')

const mysqlHost = process.env.MYSQL_HOST;
const mysqlPort = process.env.MYSQL_PORT || '3306';
const mysqlDBName = process.env.MYSQL_DATABASE;
const mysqlUser = process.env.MYSQL_USER;
const mysqlPassword = process.env.MYSQL_PASSWORD;

const maxMySQLConnections = 10;
app.locals.mysqlPool = mysql.createPool({
	connectionLimit: maxMySQLConnections,
	host: mysqlHost,
	port: mysqlPort,
	database: mysqlDBName,
	user: mysqlUser,
	password: mysqlPassword
});



app.use(bodyParser.json());
app.use(express.static('public'));

app.use(morgan('dev'));


//app.locals.mysqlPool = require('./lib/db').mysqlPool;

app.use('/', api);

app.use('*', function(req, res, next){
    res.status(404).json({
        error: "Requested resource " + req.originalUrl + " does not exist"
    });
})

mongoConnect()
	.then((client) => {
		app.locals.mongoDB = client;
	})
	.then( () => {
		app.listen(port, function () {
			console.log("== Server is running on port", port);
		});
	}) 


