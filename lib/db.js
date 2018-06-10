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



exports.mysqlPool = new Database(config);
