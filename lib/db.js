const mysql = require('mysql');

const config = {
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || '3306',
    database: process.env.MYSQL_DATABASE || 'businesses',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'a',
}

class Database {

    constructor(config) {
        this.connection = mysql.createPool(config);
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                else {
                    resolve(rows);
                }
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}

const MongoClient = require('mongodb').MongoClient;
const mongoHost = process.env.MONGO_HOST
const mongoDatabase = process.env.MONGO_DATABASE
const mongoUser = process.env.MONGO_USERNAME
const mongoPassword = process.env.MONGO_PASSWORD
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDatabase}`;


function mongoConnect() {
    return MongoClient.connect(mongoURL)
        .then((client) => {
            return Promise.resolve(client.db(mongoDatabase));
        })
        .catch((err) => console.log(err));
}

exports.mysqlPool = new Database(config);
exports.mongoConnect = mongoConnect;