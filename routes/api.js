const express = require('express')
const router = express.Router()

router.get('/info', (req, res) => { //UC-102
    res.status(200).json(
        {
            status: 200,
            message: 'Server info-endpoint',
            data: {
                studentName: '(Yong Zhe) Sven Hu',
                studentNumber: 2205932,
                description: 'Welcome to the ShareAMeal API'
            }
        }
    )
})

module.exports = router