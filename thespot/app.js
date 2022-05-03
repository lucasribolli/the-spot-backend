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
    await db.query(
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

app.post('/new-reservation', async function (req, res, next) {
  try {
    var seatId = req.body['seatId']
    var userEmail = req.body['userEmail']
    var reservationDate = req.body['reservationDate']
    await db.query(
      'INSERT INTO RESERVATIONS ' + 
      '(created_at, reservation_date, status, employee_email, id_seat)' + 
      'VALUES ($1, $2, $3, $4, $5);', 
      [moment().format(), reservationDate, 'RESERVED', userEmail, seatId])
    // Gerar QRCode
    // Enviar email com o QRCode gerado
    res.send({
      ok: true
    })
  } catch (err) {
    res.send({
      error: err
    })
  }
})

app.get('/seats-data-by-date', async function (req, res, next) {
  try {
    var date = req.query.date
    var allSeats = await db.query('SELECT id FROM SEATS')
    var reservedSeats = await db.query(
      'SELECT id_seat FROM RESERVATIONS '+
      'WHERE reservation_date = $1' +
      'AND status = $3', 
      [date, 'RESERVED'])
    var availableSeats = reservedSeats.filter(x => allSeats.indexOf(x) === -1)
    var seatsArray = []
    reservedSeats.map(item => {
      seatsArray.push({
        id: item.id,
        status: 'UNAVAILABLE',
      })
    })
    availableSeats.map(item => {
      seatsArray.push({
        id: item.id,
        status: 'AVAILABLE',
      })
    })
    
    res.send({
      seats: availableSeats.sort((a, b) => a.id > b.id ? 1 : -1)
    })
  } catch (err) {
    res.send({
      error: err
    })
  }
})
