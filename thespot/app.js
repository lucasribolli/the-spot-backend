const express = require('express')
const cors = require('cors')
const db = require('./db/index')
const moment = require('moment')

var app = express()
app.use(cors())
app.use(express.json())
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

app.get('/hasReservation', async function (req, res, next) {
  try {
    var email = req.query.email
    var reservations = await db.query(
      'SELECT * FROM RESERVATIONS '+
      'WHERE EMPLOYEE_EMAIL = $1 '+
      'AND reservation_date >= $2' +
      'AND status = $3', 
      [email, moment().format(), 'RESERVED'])
    res.send({
      hasReservation: reservations.rowCount > 0
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
      'SELECT * FROM RESERVATIONS '+
      'WHERE EMPLOYEE_EMAIL = $1 '+
      'AND reservation_date >= $2' +
      'AND status = $3', 
      [email, moment().format(), 'RESERVED'])
    res.send({
      reservation: reservations.rows[0]
    })
  } catch (err) {
    res.send({
      error: err
    })
  }
})

// async function getReservations (email) {
//   return await db.query(
//     'SELECT * FROM RESERVATIONS '+
//     'WHERE EMPLOYEE_EMAIL = $1 '+
//     'AND reservation_date >= $2' +
//     'AND status = "RESERVED"', 
//     [email, '2021-01-01'])
// }
