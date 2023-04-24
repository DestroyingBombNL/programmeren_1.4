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
let database = require('../app').database

router.post('/', (req, res) => { //UC-201
    logger.http('POST: /api/user');
    try {
        newUserData = {
            username,
            email,
            password
        } = req.body
        if (typeof newUserData.username !== "string") {
            throw new Error('Username is not a String or Missing!')
        }
        if (typeof newUserData.email !== "string") {
            throw new Error('Email is not a String or Missing!')
        }
        if (typeof newUserData.password !== "string") {
            throw new Error('Password is not a String or Missing!')
        }
        database.users.forEach(user => {
            if (newUserData.email === user.email) {
                throw new Error(`This email '${newUserData.email}' is already in use`)
            }
        });
        const newUser = {
            id: database.users[database.users.length - 1].id + 1,
            username: newUserData.username,
            email: newUserData.email,
            password: newUserData.password
        }
        const message = 'Created a new User'
        res.status(201).json(
            {
                status: 201,
                message: message,
                data: newUser
            }
        )
        logger.info('Status Code 201 - ' + message);
        database.users.push(newUser)
    } catch (error) {
        res.status(400).json(
            {
                status: 400,
                message: error.message,
                data: req.body
            }
        )
        logger.error('Status Code 400 - ' + error.message);
    }
})

router.get('/', (req, res) => { //UC-202
    logger.http('GET: /api/user');
    const field1 = req.query.field1
    const field2 = req.query.field2
    let filteredUsers = database.users
    let message = "Retrieved users"
    if (typeof field1 !== "undefined" && typeof field2 !== "undefined") {
        //users.filter(field1, field2)
        message += ` filtered by ${field1} and ${field2}`
    } else if (typeof field1 !== "undefined") {
        //users.filter(field1)
        message += ` filtered by ${field1}`
    } else if (typeof field2 !== "undefined") {
        //users.filter(field2)
        message += ` filtered by ${field2}`
    }
    res.status(200).json({
        status: 200,
        message: message,
        data: filteredUsers
    })
    logger.info('Status Code 200 - ' + message);
})
    
router.get('/profile', (req, res) => { //UC-203
    logger.http('GET: /api/user/profile');
    const message = 'User profile'
    res.status(200).json({
        status: 200,
        message: message,
        data: database.users[0]
    })
    logger.info('Status Code 200 - ' + message);
})

router.get('/:userId', (req, res) => { //UC-204
    logger.http('GET: /api/user/:userId');
    const userId = req.params.userId
    try {
        parseInt(userId)
        const message = 'Retrieved user with id: ' + userId
        database.users.forEach(user => {
            if (user.id == userId) {
                res.status(200).json(
                    {
                        status: 200,
                        message: message,
                        data: user
                    }
                )
            }
        });
        logger.info('Status Code 200 - ' + message);
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
    let oldUser = ""
    try {
        const userId = parseInt(req.params.userId)
        database.users.forEach(user => {
            if (user.id === userId) {
                oldUser = user
            }
        })
        if (typeof oldUser !== "undefined") {
            if (typeof req.body.username !== "string") {
                throw new Error('Username is not a String or Missing!')
            }
            if (typeof req.body.email !== "string") {
                throw new Error('Email is not a String or Missing!')
            }
            if (typeof req.body.password !== "string") {
                throw new Error('Password is not a String or Missing!')
            }
            const updatedUser = { 
                id: userId,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            }
            database.users[userId] = updatedUser
            const message = 'Updated user with id: ' + userId
            res.status(200).json(
                {
                    status: 200,
                    message: message,
                    data: updatedUser
                }
            )
            logger.info('Status Code 200 - ' + message);
        }
    } catch (error) {
        res.status(400).json(
            {
                status: 400,
                message: error.message,
                data: req.body
            }
        )
        logger.error('Status Code 400 - ' + error.message);
    }
})

router.delete('/:userId', (req, res) => { //UC-206
    logger.http('DELETE: /api/user/:userId');
    try {
        const users = database.users
        const userId = parseInt(req.params.userId)
        const message = 'Deleted user with Id: ' + userId
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === userId) {
                delete database[i]
                res.status(200).json(
                    {
                        status: 200,
                        message: message,
                        data: {}
                    }
                )
                logger.info('Status Code 200 - ' + message);
                break;
            }
        }   
    } catch (error) {
        res.status(400).json(
            {
                status: 400,
                message: error.message,
                data: req.body
            }
        )
        logger.error('Status Code 400 - ' + error.message);
    }
})

module.exports = router