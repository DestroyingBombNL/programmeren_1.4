const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const winston = require('winston');

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
    ],
});

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

const createToken = (userId) => {
    return token = jwt.sign({userId: userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2d' });
}

module.exports = {
    loginUser(userEmailAdress, userPassword, callback) { // UC-101
        pool.getConnection(function(err, conn) {
          if (err) {
            console.log('Errors:', err);
            callback(err, null, null);
            return;
          }
          
          if (conn) {
            const query = `SELECT * FROM user WHERE emailAdress = '${userEmailAdress}'`;
            conn.query(query, [], function(err, results) {
              if (err) {
                console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                callback(err, null, null);
                return;
              }
              
              if (results.length === 0) {
                // User not found, return "Not Authorized" message
                const error = new Error('Not Authorized');
                error.statusCode = 401;
                callback(error, null, null);
                return;
              }
              
              const user = results[0];
              if (user.password === userPassword) {
                // Password matches, create payload and generate token
                callback(null, {
                    user: user, 
                    token: createToken(user.id)
                });
              } else {
                // Password doesn't match, return "Not Authorized" message
                const error = new Error('Not Authorized');
                error.statusCode = 401;
                callback(error, null, null);
              }
            });
            pool.releaseConnection(conn);
          }
        });
      },

    createUser(newUserData, callback) { //UC-201 
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
                    } else {
                        const queryForId = `SELECT id FROM user WHERE emailAdress = \'${newUserData.emailAdress}\'`
                        conn.query(queryForId, function(err, results) {
                            if (err) {
                                console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                                callback(err, null);
                                return;
                            }
                            newUserData.id = results[0].id
                            callback(null, newUserData);
                        })
                    }
                });
                pool.releaseConnection(conn);
            }
        })
    },

    getUsers(filter1, value1, filter2, value2, callback) { //UC-202
        pool.getConnection(function(err, conn) {
            if (err) {
                console.log('Errors:', err);
                callback(err, null);
                return;
            }
            if (conn) {
                let query = `SELECT * FROM user `;
                if (typeof filter1 === 'string' && typeof filter2 === 'string') {
                    query += `WHERE ${filter1} = '${value1}' AND ${filter2} = '${value2}'`
                } else if (typeof filter1 === 'string') {
                    query += `WHERE ${filter1} = '${value1}'`
                } else if (typeof filter2 === 'string') {
                    query += `WHERE ${filter2} = '${value2}'`
                }
                query = query.replace('\'true\'', '1')
                query = query.replace('\'false\'', '0')
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
    },

    getProfile(userId, callback) { //UC-203
        pool.getConnection(function(err, conn) {
            if (err) {
                console.log('Errors:', err);
                callback(err, null);
                return;
            }
            if (conn) {
                const query = `SELECT * FROM user WHERE id = ${userId}`;
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
    },

    getUser(askedUserId, userId, callback) { //UC-204
        pool.getConnection(function(err, conn) {
            if (err) {
                console.log('Errors:', err);
                callback(err, null);
                return;
            }
            if (conn) {
                const query = `SELECT * FROM user WHERE id = ?`;
                conn.query(query, [askedUserId], function(err, userResults) {
                    if (userResults.length === 0) {
                        let err = {
                            status: 404,
                            message: 'No user found',
                            data: {}
                        };
                        callback(err);
                        return;
                    }
                    if (askedUserId !== userId) {
                        delete userResults.password;
                    }
                    const mealsQuery = `SELECT * FROM meal WHERE cookId = ?`;
                    conn.query(mealsQuery, [userId], function(err, mealsResults) {
                        if (err) {
                            console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                            callback(err, null);
                            return;
                        }
                        const mergedResults = {
                            user: userResults,
                            meals: mealsResults
                        };
                        callback(null, mergedResults);
                    });
                });
                pool.releaseConnection(conn);
            }
        })
    },

    updateUser(userId, columnsQuery, callback) { //UC-205
        pool.getConnection(function(err, conn) {
            if (err) {
                console.log('Errors:', err);
                callback(err, null);
                return;
            }
            if (conn) {
                let query = `UPDATE user SET `;
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
    },

    deleteUser(userIdToDelete, userId, callback) { //UC-206
        pool.getConnection(function(err, conn) {
            if (err) {
                console.log('Errors:', err);
                callback(err);
                return;
            }
            if (conn) {
                const query = `SELECT * FROM user WHERE id = ?`;
                conn.query(query, [userIdToDelete], function(err, results) {
                    if (err) {
                        console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                        callback(err, null);
                        return;
                    }
                    if (results.length === 0) {
                        let err = {
                            status: 404,
                            message: 'No user found',
                            data: {}
                        };
                        callback(err);
                        return;
                    }
                    if (userIdToDelete === userId) {
                        const deleteQuery = `DELETE FROM user WHERE id = ?`;
                        conn.query(deleteQuery, [userId], function(err, deleteResult) {
                            if (err) {
                                console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                                callback(err, null);
                                return;
                            }
                            callback(null);
                        });
                        pool.releaseConnection(conn);
                    } else {
                        let err = {
                            status: 403,
                            message: 'User is not authorized to delete this account',
                            data: {}
                        };
                        callback(err);
                        return;
                    }
                });
            }
        })
    },

    createMeal(newMeal, callback) { //UC-301 
        pool.getConnection(function(err, conn) {
            if (err) {
                err.status = 1006
                err.message = 'Connection closed'
                err.data = {}
                callback(err, null);
                return;
            }
            if (conn) {
                const query = `INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, createDate, updateDate, name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                conn.query(query, [newMeal.isActive, newMeal.isVega, newMeal.isVegan, newMeal.isToTakeHome, newMeal.dateTime, newMeal.maxAmountOfParticipants, newMeal.price, newMeal.imageUrl, newMeal.cookId, newMeal.createDate, newMeal.updateDate, newMeal.name], function(err, results) {
                    if (err) {
                        console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                        callback(err, null);
                        return;
                    }
                    const queryForId = `SELECT id FROM meal WHERE cookId = \'${newMeal.cookId}\'`
                    conn.query(queryForId, function(err, results) {
                        if (err) {
                            console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                            callback(err, null);
                            return;
                        }
                        newMeal.id = results[0].id
                        callback(null, newMeal);
                    })
                });
                pool.releaseConnection(conn);
            }
        })
    },

    updateMeal(mealId, columnsQuery, callback) { //UC-302
        pool.getConnection(function(err, conn) {
            if (err) {
                console.log('Errors:', err);
                callback(err, null);
                return;
            }
            if (conn) {
                let query = `UPDATE meal SET `;
                query += columnsQuery
                query += ` WHERE id = ?`
                conn.query(query, [mealId], function(err) {
                    if (err) {
                        console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                        callback(err, null);
                        return;
                    }
                    const queryForId = `SELECT * FROM meal WHERE id = ${mealId}`
                    conn.query(queryForId, function(err, results) {
                        if (err) {
                            console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                            callback(err, null);
                            return;
                        }
                        callback(null, results);
                    })
                });
                pool.releaseConnection(conn);
            }
        })
    },

    getAllMeals(callback) { //UC-303
        pool.getConnection(function(err, conn) {
            if (err) {
                console.log('Errors:', err);
                callback(err, null);
                return;
            }
            if (conn) {
                const query = `SELECT * FROM meal`;
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
    },

    getMeal(mealId, callback) { //UC-304
        pool.getConnection(function(err, conn) {
            if (err) {
                console.log('Errors:', err);
                callback(err, null);
                return;
            }
            if (conn) {
                const query = `SELECT * FROM meal WHERE id = ?`;
                conn.query(query, [mealId], function(results) {
                    if (results.length < 1) {
                        let err = {
                            status: 404,
                            message: 'No meals found',
                            data: {}
                        }
                        callback(err, null);
                        return;
                    }
                    callback(null, results);
                });
                pool.releaseConnection(conn);
            }
        })
    },

    deleteMeal(mealId, callback) { //UC-305
        pool.getConnection(function(err, conn) {
            if (err) {
                console.log('Errors:', err);
                callback(err, null);
                return;
            }
            if (conn) {
                const query = `DELETE FROM meal WHERE id = ?`;
                conn.query(query, [mealId], function(err, results) {
                    if (err) {
                        console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
                        callback(err, null);
                        return;
                    }
                    if (results.affectedRows === 0) {
                        let err = {
                            status: 404,
                            message: 'No meals found',
                            data: {}
                        }
                        callback(err, null);
                        return;
                    }
                    callback(null, results);
                });
                pool.releaseConnection(conn);
            }
        })
    }
};