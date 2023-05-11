const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS,
    connectionLimit: process.env.DB_CONNECTION_LIMIT,
    maxIdle: process.env.DB_MAX_IDLE,
    idleTimeout: process.env.DB_IDLE_TIMEOUT,
    queueLimit: process.env.DB_QUEUE_LIMIT
});

function createUser(newUserData, callback) { //UC-201 
    pool.getConnection(function(err, conn) {
        if (err) {
            console.log('Errors:', err);
            callback(err, null);
            return;
        }
        if (conn) {
            const query = `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            conn.query(query, [newUserData.firstName, newUserData.lastName, newUserData.emailAdress, newUserData.password, newUserData.phoneNumber, newUserData.street, newUserData.city], function(err, results) {
                if (err) {
                    console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                    callback(err, null);
                    return;
                }
                callback(null, results);
            });
            pool.releaseConnection(conn);
        }
    })
}



function getUsers(filter, callback) { //UC-202
    pool.getConnection(function(err, conn) {
        if (err) {
            console.log('Errors:', err);
            callback(err, null);
            return;
        }
        if (conn) {
            const query = `SELECT * FROM User `;
            if (typeof filter === "string") {
                query += filter
            }
            conn.query(query, [], function(err, results) {
                if (err) {
                    console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                    callback(err, null);
                    return;
                }
                callback(null, results);
            });
            pool.releaseConnection(conn);
        }
    })
}

function getProfile(callback) { //UC-203
    pool.getConnection(function(err, conn) {
        if (err) {
            console.log('Errors:', err);
            callback(err, null);
            return;
        }
        if (conn) {
            const query = `SELECT * FROM User WHERE id = 1`;
            conn.query(query, [], function(err, results) {
                if (err) {
                    console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                    callback(err, null);
                    return;
                }
                callback(null, results);
            });
            pool.releaseConnection(conn);
        }
    })
}

function getUser(userId, callback) { //UC-204
    pool.getConnection(function(err, conn) {
        if (err) {
            console.log('Errors:', err);
            callback(err, null);
            return;
        }
        if (conn) {
            const query = `SELECT * FROM User WHERE id = ?`;
            conn.query(query, [userId], function(err, results) {
                if (err) {
                    console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                    callback(err, null);
                    return;
                }
                callback(null, results);
            });
            pool.releaseConnection(conn);
        }
    })
}

function updateUser(userId, columnsQuery, callback) { //UC-205
    pool.getConnection(function(err, conn) {
        if (err) {
            console.log('Errors:', err);
            callback(err, null);
            return;
        }
        if (conn) {
            const query = `UPDATE User SET `;
            query += columnsQuery
            query += ` WHERE id = ?`
            conn.query(query, [userId], function(err, results) {
                if (err) {
                    console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                    callback(err, null);
                    return;
                }
                callback(null, results);
            });
            pool.releaseConnection(conn);
        }
    })
}

function deleteUser(userId, callback) { //UC-206
    pool.getConnection(function(err, conn) {
        if (err) {
            console.log('Errors:', err);
            callback(err, null);
            return;
        }
        if (conn) {
            const query = `DELETE FROM User WHERE id = ?`;
            conn.query(query, [userId], function(err, results) {
                if (err) {
                    console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                    callback(err, null);
                    return;
                }
                callback(null, results);
            });
            pool.releaseConnection(conn);
        }
    })
}

exports.createUser = createUser;
exports.getUsers = getUsers;
exports.getProfile = getProfile;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;