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
    res.send({
      authorized: employees.rowCount > 0
    })
  } catch (err) {
    res.send({
      error: err
    })
  }
})

app.get('/reservation', async function (req, res, next) {
  try {
    var email = req.query.email
    var reservations = await db.query(
      'SELECT * FROM RESERVATIONS WHERE EMPLOYEE_EMAIL = $1', [email])
    res.send({
      reservations: reservations.rows
    })
  } catch (err) {
    res.send({
      error: err
    })
  }
})
