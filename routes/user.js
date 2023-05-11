const express = require('express')
const bodyParser = require('body-parser')
const winston = require('winston');
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
const router = express.Router()
router.use(bodyParser.json())
let database = require('../database')
const Joi = require('joi');

const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    emailAdress: Joi.string().pattern(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/).required(),
    password: Joi.string().min(6).required(),
    phoneNumber: Joi.string().pattern(/^\d{10}$/).required(),
    street: Joi.string().required(),
    city: Joi.string().required(),
});

const validateFields = (data) => {
    const { error, value } = schema.validate(data);
    if (error) {
        throw new Error(error.details[0].message);
    }
    return value;
};

router.post('/', (req, res) => { //UC-201
    logger.http('POST: /api/user');
    try {
        const validatedData = validateFields(req.body);
        database.createUser(req.body, function(err, results) {
            if (err) {
                res.status(400).json(
                    {
                        status: 400,
                        message: err.sqlMessage,
                        data: {}
                    }
                )
                logger.error('Status Code 400 - ' + err);
            } else {
                res.status(201).json(
                    {
                        status: 201,
                        message: 'Affected rows: ' + results.affectedRows,
                        data: results
                    }
                )
                logger.info('Status Code 201 - ' + results.affectedRows);
            }
        })
        console.log(validatedData);
      } catch (error) {
        res.status(400).json(
            {
                status: 400,
                message: error,
                data: {}
            }
        )
        logger.error('Status Code 400 - ' + error.message);
      }
})

router.get('/', (req, res) => { //UC-202
    logger.http('GET: /api/user');
    const role = req.query.role
    const isActive = req.query.active
    let message = "Retrieved users"
    let query;
    let onlyfilter = true;
    if (typeof role === "string") {
        query += ` HERE role = ${role} AND `
        message += `filtered by role: ${role}`
        onlyfilter = false;
    }

    if (typeof isActive !== "undefined") {
        if (onlyfilter) {
            query += `WHERE`
        } 
        query += ` isActive = ${isActive} AND `
        message += `filtered by isActive: ${isActive}`
        onlyfilter = false;
    }

    if (typeof query === "string") {
        query.slice(0, -4);
    }
    database.getUsers(query, function(err, results) {
        if (err) {
            res.status(400).json(
                {
                    status: 400,
                    message: err.sqlMessage,
                    data: {}
                }
            )
            logger.error('Status Code 400 - ' + err);
        } else {
            res.status(200).json({
                status: 200,
                message: message,
                data: results
            })
            logger.info('Status Code 200 - ' + message);
        }
    });
})
    
router.get('/profile', (req, res) => { //UC-203
    logger.http('GET: /api/user/profile');
    const message = 'User profile'
    database.getProfile(function(err, results) {
        if (err) {
            res.status(400).json(
                {
                    status: 400,
                    message: err.sqlMessage,
                    data: {}
                }
            )
            logger.error('Status Code 400 - ' + err);
        } else {
            res.status(200).json({
                status: 200,
                message: message,
                data: results
            })
            logger.info('Status Code 200 - ' + message);
        }
    })
})

router.get('/:userId', (req, res) => { //UC-204
    logger.http('GET: /api/user/:userId');
    const userId = req.params.userId
    const message = `Retrieved user with id: ${userId}`
    try {
        parseInt(userId)
        database.getUser(userId, function(err, results) {
            if (err) {
                res.status(400).json(
                    {
                        status: 400,
                        message: err.sqlMessage,
                        data: {}
                    }
                )
                logger.error('Status Code 400 - ' + err);
            } else {
                res.status(200).json({
                    status: 200,
                    message: message,
                    data: results
                })
                logger.info('Status Code 200 - ' + message);
            }
        })
    } catch (error) {
        res.status(400).json(
            {
                status: 400,
                message: "Id is not a Number or Missing!",
                data: userId
            }
        )
        logger.error('Status Code 400 - ' + error.message);
    }
})

router.put('/:userId', (req, res) => { //UC-205
    logger.http('PUT: /api/user/:userId');
    try {
        const userId = parseInt(req.params.userId)
        const message = 'Updated user with id: ' + userId
        let query = "";
        if (typeof req.body.firstName === "string") {
            query += `firstName = \'${req.body.firstName}\', `
        } else {
            logger.info('No firstname was defined correctly');
        }

        if (typeof req.body.lastName === "string") {
            query += `lastName = \'${req.body.lastName}\', `
        } else {
            logger.info('No lastname was defined correctly');
        }

        if (typeof req.body.emailAdress === "string") {
            query += `emailAdress = \'${req.body.emailAdress}\', `
        } else {
            logger.info('No emailAdress was defined correctly');
        }
        
        if (typeof req.body.password === "string") {
            query += `password = \'${req.body.password}\', `
        } else {
            logger.info('No password was defined correctly');
        }
        
        if (typeof req.body.phoneNumber === "string") {
            query += `phoneNumber = \'${req.body.phoneNumber}\', `
        } else {
            logger.info('No phonenumber was defined correctly');
        }
        
        if (typeof req.body.street === "string") {
            query += `street = \'${req.body.street}\', `
        } else {
            logger.info('No street was defined correctly');
        }
        
        if (typeof req.body.city === "string") {
            query += `city = \'${req.body.city}\', `
        } else {
            logger.info('No city was defined correctly');
        }

        if (query !== "") {
            query = query.substring(0, query.length - 2)
            database.updateUser(userId, query, function(err, results) {
                if (err) {
                    res.status(400).json(
                        {
                            status: 400,
                            message: err.sqlMessage,
                            data: {}
                        }
                    )
                    logger.error('Status Code 400 - ' + err);
                } else {
                    res.status(200).json(
                        {
                            status: 200,
                            message: message,
                            data: results
                        }
                    )
                    logger.info('Status Code 200 - ' + message);
                }
            })
        } else {
            throw new Error('Nothing needs to be updated!')
        }
    } catch (error) {
        res.status(400).json(
            {
                status: 400,
                message: error.message,
                data: {}
            }
        )
        logger.error('Status Code 400 - ' + error.message);
    }
})

router.delete('/:userId', (req, res) => { //UC-206
    logger.http('DELETE: /api/user/:userId');
    try {
        const userId = parseInt(req.params.userId)
        const message = `Deleted user with id: ${userId}`
        database.deleteUser(userId, function(err, results) {
            if (err) {
                res.status(400).json(
                    {
                        status: 400,
                        message: err.sqlMessage,
                        data: {}
                    }
                )
                logger.error('Status Code 400 - ' + err);
            } else {
                res.status(200).json(
                    {
                        status: 200,
                        message: message,
                        data: {}
                    }
                )
                logger.info('Status Code 200 - ' + message);
            }
        })
    } catch (error) {
        res.status(400).json(
            {
                status: 400,
                message: 'Id is not a number',
                data: {}
            }
        )
        logger.error('Status Code 400 - ' + error.message);
    }
})

module.exports = router