const express = require('express')
const bodyParser = require('body-parser')
const winston = require('winston');
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ]
});
const router = express.Router()
router.use(bodyParser.json())
let database = require('../database')
const Joi = require('joi');
const authenticationController = require('./authentication.controller');

const createUserSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    isActive: Joi.number().valid(0, 1).optional(),
    emailAdress: Joi.string().pattern(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/).required(),
    password: Joi.string().min(6).required(),
    phoneNumber: Joi.string().pattern(/^\d{10}$/).required(),
    street: Joi.string().required(),
    city: Joi.string().required(),
});

const updateUserSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    emailAdress: Joi.string().optional(),
    password: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    street: Joi.string().optional(),
    city: Joi.string().optional(),
  });

const validateCreateUserFields = (data) => {
    const { error, value } = createUserSchema.validate(data);
    if (error) {
        throw new Error(error.details[0].message);
    }
    return value;
};

const validateUpdateUserFields = (data) => {
    const { error, value } = updateUserSchema.validate(data);
    if (error) {
        throw new Error(error.details[0].message);
    }
    return value;
};

module.exports = {
    createUser(req, res, next) { //UC-201
        let message = 'A new user has been created'
        logger.http('POST: /api/user');
        try {
            validateCreateUserFields(req.body);
            database.createUser(req.body, function(err, results) {
                if (err) {
                    return next({
                        status: 403, 
                        message: 'This user already exists', 
                        data: {}
                    });
                } else {
                    res.status(201).json(
                        {
                            status: 201,
                            message: message,
                            data: results
                        }
                    )
                    logger.info('Status Code 201 - ' + message);
                }
            })
        } catch (err) {
            return next({
                status: 400, 
                message: err.message, 
                data: {}
            });
        }
    },

    getAllUsers(req, res, next) { //UC-202
        logger.http('GET: /api/user');
        const queryField = Object.entries(req.query);
        let filter1, value1, filter2, value2;
        let message = '0 parameters'
        
        if (typeof queryField[0] === 'object') {
            if (typeof queryField[0][0] === 'string') {
            filter1 = queryField[0][0];
            } 
            if (typeof queryField[0][1] === 'string') {
            value1 = queryField[0][1];
            }
        }
        if (typeof queryField[1] === 'object') {
            if (typeof queryField[1][0] === 'string') {
            filter2 = queryField[1][0];
            }
            if (typeof queryField[1][1] === 'string') {
            value2 = queryField[1][1];
            }
        }
        
        database.getUsers(filter1, value1, filter2, value2, function(err, results) {
            if (err) {
                return next({
                    status: 400,
                    message: err.sqlMessage || err.message,
                    data: {}
                });
            } else {
                if (typeof queryField[0] === 'object' && typeof queryField[1] === 'object') {
                    message = '2 parameters';
                    logger.info(`field1: ${queryField[0][0]} = ${queryField[0][1]}`);
                    logger.info(`field2: ${queryField[1][0]} = ${queryField[1][1]}`);
                    logger.info(`Status Code 200 - Filtered on ${message}`);
                } else if (typeof queryField[0] === 'object') {
                    message = '1 parameter';
                    logger.info(`field1: ${queryField[0][0]} = ${queryField[0][1]}`);
                } else if (typeof queryField[1] === 'object') {
                    message = '1 parameter';
                    logger.info(`field2: ${queryField[1][0]} = ${queryField[1][1]}`);
                }
                res.status(200).json({
                    status: 200,
                    message: `Filtered on ${message}`,
                    data: results
                });
            }
        });
    },
        
    getProfile(req, res, next) { //UC-203
        logger.http('GET: /api/user/profile');
        let message = 'User profile';
        authenticationController.validateToken(req, res, next, function(err, userId) {
            if (err) {
                return next({
                    status: err.status, 
                    message: err.message, 
                    data: err.data
                });
            } else {
                req.body.userId = userId;
                database.getProfile(req.body.userId, function(err, results) {
                    if (err) {
                        return next({
                            status: 400,
                            message: err.sqlMessage || err.message,
                            data: {}
                        });
                    }
                    res.status(200).json({
                        status: 200,
                        message: message,
                        data: results
                    });
                    logger.info('Status Code 200 - ' + message);
                });
            }
        });
    },

    getUser(req, res, next) { //UC-204
        logger.http('GET: /api/user/:userId');
        const userId = req.params.userId;
        let message = `Retrieved user with id: ${userId}`;
        try {
            const parsedAskedUserId = parseInt(userId);
            authenticationController.validateToken(req, res, next, function(err, userId) {
                if (err) {
                    return next({
                        status: err.status, 
                        message: err.message, 
                        data: err.data
                    });
                } else {
                    req.body.userId = userId;
                    if (isNaN(parsedAskedUserId)) {
                        throw new Error("Id is not a Number or Missing!");
                    }
        
                    database.getUser(parsedAskedUserId, req.body.userId, function(err, results) {
                        if (err) {
                            return next({
                                status: err.status,
                                message: err.sqlMessage || err.message,
                                data: err.data
                            });
                        } else {
                            res.status(200).json({
                                status: 200,
                                message: message,
                                data: results
                            });
                            logger.info('Status Code 200 - ' + message);
                        }
                    });
                }
            })
        } catch (error) {
            return next({
                status: 400,
                message: error.message,
                data: userId
            });
        }
    },

    updateUser(req, res, next) { //UC-205
        logger.http('PUT: /api/user/:userId');
        try {
            const userId = parseInt(req.params.userId);
            const message = 'Updated user with id: ' + userId;
            let query = '';
            validateUpdateUserFields(req.body);
        
            if (typeof req.body.firstName === 'string') {
                query += `firstName = '${req.body.firstName}', `;
            } else {
                logger.info('No firstname was defined correctly');
            }
        
            if (typeof req.body.lastName === 'string') {
                query += `lastName = '${req.body.lastName}', `;
            } else {
                logger.info('No lastname was defined correctly');
            }
        
            if (typeof req.body.emailAdress === 'string') {
                query += `emailAdress = '${req.body.emailAdress}', `;
            } else {
                logger.info('No emailAdress was defined correctly');
            }
        
            if (typeof req.body.password === 'string') {
                query += `password = '${req.body.password}', `;
            } else {
                logger.info('No password was defined correctly');
            }
        
            if (typeof req.body.phoneNumber === 'string') {
                query += `phoneNumber = '${req.body.phoneNumber}', `;
            } else {
                logger.info('No phonenumber was defined correctly');
            }
        
            if (typeof req.body.street === 'string') {
                query += `street = '${req.body.street}', `;
            } else {
                logger.info('No street was defined correctly');
            }
        
            if (typeof req.body.city === 'string') {
                query += `city = '${req.body.city}', `;
            } else {
                logger.info('No city was defined correctly');
            }
        
            if (query !== '') {
                query = query.substring(0, query.length - 2);
            
                database.updateUser(userId, query, function(err, results) {
                    if (err) {
                        return next({
                            status: 400,
                            message: err.sqlMessage || err.message,
                            data: {}
                        });
                    }
                    res.status(200).json({
                        status: 200,
                        message: message,
                        data: results
                    });
                    logger.info('Status Code 200 - ' + message);
                });
            } else {
                throw new Error('Nothing needs to be updated!');
            }
        } catch (error) {
            return next({
                status: 400,
                message: error.message,
                data: {}
            });
        }
    },

    deleteUser(req, res, next) { //UC-206
        logger.http('DELETE: /api/user/:userId');
        
        try {
            const userIdToDelete = parseInt(req.params.userId);
            const message = `Deleted user with id: ${userIdToDelete}`;
            authenticationController.validateToken(req, res, next, function(err, userId) {
                if (err) {
                    return next({
                        status: err.status, 
                        message: err.message, 
                        data: err.data
                    });
                } else {
                    req.body.userId = userId;
                    if (isNaN(userIdToDelete)) {
                        throw new Error('Id is not a number');
                    }
                
                    database.deleteUser(userIdToDelete, req.body.userId, function(err) {
                        if (err) {
                            return next({
                                status: err.status,
                                message: err.sqlMessage || err.message,
                                data: err.data
                            });
                        }
                    
                        res.status(200).json({
                            status: 200,
                            message: message,
                            data: {}
                        });
                        logger.info('Status Code 200 - ' + message);
                    });
                }
            });
        } catch (error) {
            return next({
                status: error.status,
                message: error.message,
                data: error.data
            });
        }
    }
};