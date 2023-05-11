const express = require('express')
const app = express()
const port = 3000

const winston = require('winston');
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

/*
let database = {
  users: [
      {
          id: 1,
          username: "Sven1",
          email: "Svenhu@live.nl1",
          password:"123qwe1"
      },
      {
          id: 2,
          username: "Sven2",
          email: "Svenhu@live.nl2",
          password:"123qwe2"
      },
      {
          id: 3,
          username: "Sven3",
          email: "Svenhu@live.nl3",
          password:"123qwe3"
      },
      {
          id: 4,
          username: "Sven4",
          email: "Svenhu@live.nl4",
          password:"123qwe4"
      }
  ]
}

exports.database = database
logger.info('Database created and exported');
*/

const api = require('./routes/api')
const user = require('./routes/user') //CRUD, C, Register a User, R, Get that User back with the Id && Filter User by Id && Get the details of the User, U, Update the User information, D, Delete the User

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use('/api', api)
app.use('/api/user', user)

app.use('*', (req, res) => {
  const message = 'Endpoint not found'
  res.status(404).json({
      status: 404,
      message: message,
      data: {}
  })
  logger.error('Status Code 404 - ' + message);
})

app.use('*', (req, res) => {
  const message = 'Something broke'
  res.status(500).json({
      status: 500,
      message: message,
      data: {}
  })
  logger.error('Status Code 500 - ' + message);
})

module.exports = app