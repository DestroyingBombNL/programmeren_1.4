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

const createMealSchema = Joi.object({
    isActive: Joi.boolean().optional(),
    isVega: Joi.boolean().optional(),
    isVegan: Joi.boolean().optional(),
    isToTakeHome: Joi.boolean().optional(),
    dateTime: Joi.date().required(),
    maxAmountOfParticipants: Joi.number().integer().optional(),
    price: Joi.number().precision(2).optional(),
    imageUrl: Joi.string().required(),
    cookId: Joi.number().required(),
    createDate: Joi.date().iso().optional(),
    updateDate: Joi.date().iso().optional(),
    name: Joi.string().required().max(200),
    description: Joi.string().required().max(400),
    allergenes: Joi.array().items(Joi.string().valid('gluten', 'lactose', 'noten')).default([]).optional(),
});

const updateMealSchema = Joi.object({
    isActive: Joi.boolean().optional(),
    isVega: Joi.boolean().optional(),
    isVegan: Joi.boolean().optional(),
    isToTakeHome: Joi.boolean().optional(),
    dateTime: Joi.date().optional(),
    maxAmountOfParticipants: Joi.number().integer().optional(),
    price: Joi.number().precision(2).optional(),
    imageUrl: Joi.string().optional(),
    cookId: Joi.number().allow(null).optional(),
    createDate: Joi.date().iso().optional(),
    updateDate: Joi.date().iso().optional(),
    name: Joi.string().optional().max(200),
    description: Joi.string().optional().max(400),
    allergenes: Joi.array().items(Joi.string().valid('gluten', 'lactose', 'noten')).default([]).optional(),
  });

const validateCreateMealFields = (data) => {
    const { error, value } = createMealSchema.validate(data);
    if (error) {
        throw new Error(error.details[0].message);
    }
    return value;
};

const validateUpdateMealFields = (data) => {
    const { error, value } = updateMealSchema.validate(data);
    if (error) {
        throw new Error(error.details[0].message);
    }
    return value;
};

module.exports = {
    createMeal(req, res, next) { //UC-301
        let message = 'A new meal has been created'
        logger.http('POST: /api/meal');
        try {
            authenticationController.validateToken(req, res, next, function(err, userId) {
                if (err) {
                    return next({
                        status: err.status, 
                        message: err.message, 
                        data: err.data
                    });
                }
                req.body.cookId = userId;
            });
            validateCreateMealFields(req.body);
            database.createMeal(req.body, function(err, results) {
                if (err) {
                    return next({
                        status: err.status, 
                        message: err.message, 
                        data: err.data
                    });
                }
                res.status(201).json(
                    {
                        status: 201,
                        message: message,
                        data: results
                    }
                )
                logger.info('Status Code 201 - ' + message);
            })
        } catch (err) {
            return next({
                status: 400, 
                message: err.message, 
                data: {}
            });
        }
    },

    updateMeal(req, res, next) { //UC-302
        logger.http('PUT: /api/meal/:mealId');
        try {
            const mealId = parseInt(req.params.mealId);
            const message = 'Updated meal with id: ' + mealId;
            let query = '';
            validateUpdateMealFields(req.body);

            if (typeof req.body.name === 'string') {
                query += `name = '${req.body.name}', `;
            } else {
                logger.info('No name was defined correctly');
            }
            
            if (typeof req.body.description === 'string') {
                query += `description = '${req.body.description}', `;
            } else {
                logger.info('No description was defined correctly');
            }
            
            if (Array.isArray(req.body.allergenes)) {
                const allergenes = req.body.allergenes.join("','");
                query += `allergenes = '${allergenes}', `;
            } else {
                logger.info('No allergenes were defined correctly');
            }
            
            if (typeof req.body.isActive === 'boolean') {
                query += `isActive = ${req.body.isActive ? '1' : '0'}, `;
            } else {
                logger.info('No isActive was defined correctly');
            }
            
            if (typeof req.body.isVega === 'boolean') {
                query += `isVega = ${req.body.isVega ? '1' : '0'}, `;
            } else {
                logger.info('No isVega was defined correctly');
            }
            
            if (typeof req.body.isVegan === 'boolean') {
                query += `isVegan = ${req.body.isVegan ? '1' : '0'}, `;
            } else {
                logger.info('No isVegan was defined correctly');
            }
            
            if (typeof req.body.isToTakeHome === 'boolean') {
                query += `isToTakeHome = ${req.body.isToTakeHome ? '1' : '0'}, `;
            } else {
                logger.info('No isToTakeHome was defined correctly');
            }
            
            if (typeof req.body.maxAmountOfParticipants === 'number') {
                query += `maxAmountOfParticipants = ${req.body.maxAmountOfParticipants}, `;
            } else {
                logger.info('No maxAmountOfParticipants was defined correctly');
            }
            
            if (typeof req.body.price === 'number') {
                query += `price = ${req.body.price.toFixed(2)}, `;
            } else {
                logger.info('No price was defined correctly');
            }
            
            if (typeof req.body.imageUrl === 'string') {
                query += `imageUrl = '${req.body.imageUrl}', `;
            } else {
                logger.info('No imageUrl was defined correctly');
            }
            
            if (query !== '') {
                query = query.substring(0, query.length - 2);
                database.updateMeal(mealId, query, function(err, results) {
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

    getAllMeals(req, res, next) { //UC-303
        logger.http('GET: /api/meal');
        let message = 'All meals retrieved'
        database.getAllMeals(function(err, results) {
            if (err) {
                return next({
                    status: 400,
                    message: err.sqlMessage || err.message,
                    data: {}
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
    },
        
    getMeal(req, res, next) { //UC-304
        logger.http('GET: /api/meal/:mealId');
        const mealId = req.params.mealId;
        let message = `Meal with id: ${mealId} retrieved`;
        database.getMeal(mealId, function(err, results) {
            if (err) {
                return next({
                    status: 404,
                    message: err.message,
                    data: {}
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
    },

    deleteMeal(req, res, next) { //UC-305
        logger.http('DELETE: /api/meal/:mealId');
        const mealId = req.params.mealId;
        let message = `Meal with id: ${mealId} deleted`;
        try {
            parsedMealId = parseInt(mealId);
            database.deleteMeal(parsedMealId, function(err) {
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
                        data: {}
                    });
                    logger.info('Status Code 200 - ' + message);
                }
            });
        } catch (error) {
            return next({
                status: 400,
                message: error.message,
                data: userId
            });
        }
    }
};