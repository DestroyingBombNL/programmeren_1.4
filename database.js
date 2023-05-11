const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    idleTimeout: 60000,
    queueLimit: 0
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
                const queryForId = `SELECT * FROM user WHERE emailAdress = \'${newUserData.emailAdress}\'`
                conn.query(queryForId, function(err, results) {
                    if (err) {
                        console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                        callback(err, null);
                        return;
                    }
                    newUserData.id = results
                    callback(null, newUserData);
                })
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
            const query = `SELECT * FROM user `;
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
            const query = `SELECT * FROM user WHERE id = 1`;
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
            const query = `SELECT * FROM user WHERE id = ?`;
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
            const query = `UPDATE user SET `;
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
            const query = `DELETE FROM user WHERE id = ?`;
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