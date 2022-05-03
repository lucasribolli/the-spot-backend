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
    var reservation = await db.query(
      'SELECT * FROM RESERVATIONS '+
      'WHERE EMPLOYEE_EMAIL = $1 '+
      'AND reservation_date >= $2' +
      'AND status = $3', 
      [email, moment().format(), 'RESERVED'])
    res.send({
      hasReservation: reservation.rowCount > 0
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
    var reservation = await db.query(
      'SELECT * FROM RESERVATIONS '+
      'WHERE EMPLOYEE_EMAIL = $1 '+
      'AND reservation_date >= $2' +
      'AND status = $3', 
      [email, moment().format(), 'RESERVED'])
    res.send({
      reservation: reservation.rows[0]
    })
  } catch (err) {
    res.send({
      error: err
    })
  }
})

app.get('/reservations', async function (req, res) {
  const reservations = []

  try {
    for (i = 0; i < 4; i++) {
      const reservation = await db.query(
        `SELECT ID_SEAT FROM RESERVATIONS
        WHERE reservation_date = $1
        AND status = $2`, [moment().format().add(i, "days"), 'RESERVED']
      )
      reservations.push({reservation: reservation.rows})
    }
    res.send(reservations)
  } catch (err) {
    res.send({
      error: err
    })
  }
})

app.put('/cancel-reservation', async function (req, res, next) {
  try {
    var reservationId = req.body['reservationId']
    var cancelReservation = await db.query(
      'UPDATE RESERVATIONS '+
      'SET STATUS = $1 '+
      'WHERE id = $2', 
      ['CANCELED', reservationId])
    res.send({
      ok: true
    })
  } catch (err) {
    res.send({
      error: err
    })
  }
})
