const express = require('express')
const app = express()
require('dotenv').config();
const port = process.env.PORT;

const winston = require('winston');
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ]
});

const authentication = require('./routes/auth.routes')
const user = require('./routes/user.routes')
const meal = require('./routes/meal.routes');

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// For access to application/json request body
app.use(express.json());

app.get('/api/info', (req, res) => { //UC-102
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
app.use('/api/login', authentication)
app.use('/api/user', user)
app.use('/api/meal', meal)

app.use((err, req, res, next) => {
  if (typeof err.status === 'undefined') {
    return next();
  }
  res.status(err.status).json({
    status: err.status,
    message: err.message,
    data: err.data
  });
  logger.error(`Status Code ${err.status} - ${err.message}`);
});

app.use((req, res, next) => {
  const message = 'Endpoint not found';
  res.status(404).json({
    status: 404,
    message: message,
    data: {}
  });
  logger.error('Status Code 404 - ' + message);
});

app.use((req, res, next) => {
  const message = 'Something broke';
  res.status(500).json({
    status: 500,
    message: message,
    data: {}
  });
  logger.error('Status Code 500 - ' + message);
});

module.exports = app