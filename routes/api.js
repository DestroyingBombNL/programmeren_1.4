const express = require('express')
const router = express.Router()
const winston = require('winston');
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

router.get('/info', (req, res) => { //UC-102
    logger.http('GET: /api/info called');
    res.status(200).json(
        {
            status: 200,
            message: 'Student Information',
            data: {
                studentName: '(Yong Zhe) Sven Hu',
                studentNumber: 2205932,
                description: 'Welcome to the ShareAMeal API'
            }
        }
    )
    logger.info('Status Code 200 - ' + res.message);
})

module.exports = router