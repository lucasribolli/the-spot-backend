const express = require('express')
var bodyParser = require('body-parser')
const cors = require('cors')
const db = require('./db/index')

var app = express()
app.use(cors())
app.use(bodyParser.json())
PORT = process.env.PORT || 4000

app.set('port', PORT)
app.listen(PORT, function () {
  console.log('Server is running...')
})

app.get('/auth', async function (req, res, next) {
  try {
    var email = req.query.email
    var employees = await db.query(
      'SELECT EMAIL FROM EMPLOYEES WHERE EMAIL = $1', [email])
    var response = new Object()
    response.authorized = employees.rowCount > 0
    res.send(response)
  } catch (err) {
    var responseError = new Object()
    responseError.error = err
    res.send(responseError)
  }
})