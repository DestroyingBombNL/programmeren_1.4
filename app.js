let database = {
  users: [
      {
          id: 0,
          username: "Sven0",
          email: "Svenhu@live.nl0",
          password:"123qwe0"
      },
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
      }
  ]
}
exports.database = database

const express = require('express')
const app = express()
const port = 3000
const api = require('./routes/api')
const user = require('./routes/user') //CRUD, C, Register a User, R, Get that User back with the Id && Filter User by Id && Get the details of the User, U, Update the User information, D, Delete the User

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use('/api', api)
app.use('/api/user', user)

app.use('*', (req, res) => {
  res.status(404).json({
      status: 404,
      message: 'Endpoint not found',
      data: {}
  })
})

app.use('*', (req, res) => {
  res.status(500).json({
      status: 500,
      message: 'Something broke!',
      data: {}
  })
})

module.exports = app