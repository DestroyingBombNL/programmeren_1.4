const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
router.use(bodyParser.json())
let database = require('../app').database


router.post('/', (req, res) => { //UC-201
    try {
        const body = req.body
        if (typeof body.username !== "string") {
            throw new Error('Parameter is not a String!')
        }
        if (typeof body.email !== "string") {
            throw new Error('Parameter is not a String!')
        }
        if (typeof body.password !== "string") {
            throw new Error('Parameter is not a String!')
        }
        const newUser = {
            id: database.length + 1,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        }
        res.status(200).json(
            {
                status: 200,
                message: 'Server info-endpoint',
                data: newUser
            }
        )
        res.send(`Created user with Username: ${username}, Email: ${email}, Password: ${password}`)
        database.users.push(newUser)
    } catch (error) {
        console.log(error.message);
        res.status(400).json(
            {
                status: 400,
                message: error.message,
                data: req.body
            }
        )
    }
})
    
router.get('/', (req, res) => { //UC-202
    const field1 = req.query.field1
    const field2 = req.query.field2
    let filteredUsers = database.users
    if (typeof field1 !== "undefined" && typeof field2 !== "undefined") {
        //users.filter(field1, field2)
    } else if (field1 !== "undefined") {
        //users.filter(field1)
    } else if (field2 !== "undefined") {
        //users.filter(field2)
    }
    res.status(200).json({
        status: 200,
        message: 'User end-point',
        data: filteredUsers
    })
})

router.get('/profile', (req, res) => { //UC-203
    res.status(200).json({
        status: 200,
        message: 'Profile end-point',
        data: database.users[0]
    })
})

router.get('/user/:userId', (req, res) => { //UC-204
    const userId = req.params.userId
    try {
        if (typeof userId !== "number") {
            throw new Error('Parameter is not a Number!')
        }
        database.users.array.forEach(user => {
            if (user.id == userId) {
                res.status(200).json(
                    {
                        status: 200,
                        data: user
                    }
                )
            }
        });
    } catch (error) {
        res.status(400).json(
            {
                status: 400,
                message: error.message,
                data: userId
            }
        )
    }
})

router.put('/user/:userId', (req, res) => { //UC-205
    const userId = req.params.userId
    let oldUser
    database.users.array.forEach(user => {
        if (user.id == userId) {
            oldUser = user
        }
    });
    if (typeof oldUser !== "undefined") {
        try {
            if (typeof newUser.username !== "string") {
                throw new Error('Parameter is not a String!')
            }
            if (typeof newUser.email !== "string") {
                throw new Error('Parameter is not a String!')
            }
            if (typeof newUser.password !== "string") {
                throw new Error('Parameter is not a String!')
            }
            const updatedUser = { 
                username, 
                email, 
                password
            } = req.body
            newUser.splice(0, 1, oldUser.userId)
            database.users[oldUser.userId] = newUser
            res.status(200).json(
                {
                    status: 200,
                    data: newUser
                }
            )
            res.send(`Updated user with Username: ${oldUser.username}, Email: ${oldUser.email}, Password: ${oldUser.password} to 
            \n Username: ${updatedUser.username}, Email: ${updatedUser.email}, Password: ${updatedUser.password}`)
        } catch (error) {
            res.status(400).json(
                {
                    status: 400,
                    message: error.message,
                    data: newUser
                }
            )
        }
    }
})

router.delete('/user/:userId', (req, res) => { //UC-206
    const users = database.users
    const userId = req.params.userId
    for (let i = 0; i < users.length; i++) {
        if (users[i].userId === userId) {
            database.splice(i, 1)
            res.send(`Deleted user with Id: ${userId}`)
            break;
        }
    }
})

module.exports = router