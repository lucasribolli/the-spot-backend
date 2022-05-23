const express = require('express')
const cors = require('cors')
const db = require('./db/index')
const moment = require('moment')
const QRCode = require('qrcode')
const nodemailer = require("nodemailer");

async function getSeatsStatusByDate (date) {
  try {
    var allSeats = await db.query('SELECT id FROM SEATS')
    var reservedSeats = await db.query(
      'SELECT id_seat as id FROM RESERVATIONS '+
      'WHERE reservation_date = $1 ' +
      'AND status = $2', 
      [date, 'RESERVED'])
    var availableSeats = allSeats.rows.filter(item1 => {
      return !reservedSeats.rows.some(item2 => {
        return item1.id === item2.id;
      });
    });
    var seatsArray = []
    reservedSeats.rows.map(item => {
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
    
    return seatsArray.sort((a, b) => a.id > b.id ? 1 : -1)
  } catch (err) {
    return err
  }
}

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
      'AND reservation_date >= $2 ' +
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
      'AND reservation_date >= $2 ' +
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
      '(created_at, reservation_date, status, employee_email, id_seat) ' + 
      'VALUES ($1, $2, $3, $4, $5);', 
      [moment().format(), reservationDate, 'RESERVED', userEmail, seatId])

    res.send({
      ok: true
    })
  } catch (err) {
    res.send({
      error: err
    })
  }
})

app.post('/new-reservation-qrcode', async function (req, res, next) {
  try {
    var seatId = req.body['seatId']
    var userEmail = req.body['userEmail']
    var reservationDate = req.body['reservationDate']
    var reservation = await db.query(
      'INSERT INTO RESERVATIONS ' + 
      '(created_at, reservation_date, status, employee_email, id_seat) ' + 
      'VALUES ($1, $2, $3, $4, $5) RETURNING id;', 
      [moment().format(), reservationDate, 'RESERVED', userEmail, seatId])

    console.log("Inicio")
    console.log(reservation)
    console.log(reservation.rows)
    console.log(reservation.rows[0].id)
    console.log(reservationDate)
    console.log(seatId)

    var qrCodeData = {
      id: reservation.rows[0].id,
      date: reservationDate,
      idSeat: seatId
    }

    console.log(0)

    var qrCodeImg = await QRCode.toDataURL(JSON.stringify(qrCodeData));

    console.log(1)

    var account = await nodemailer.createTestAccount();

    console.log(2)

    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });

    console.log(3)

    var mailOptions = {
      from: '"Equipe The Spot" <naoresponda@thespot.com>',
      to: userEmail,
      subject: 'Confirmação de Reserva de assento.',
      text: 'Olá! Estamos mandando esse email para confirmar a reserva do assento ' + 
      seatId + ' no dia ' + moment(reservationDate).format('DD/MM/YYYY') + '.',
      html: 'QR Code de confirmação: </br> <img src="' + qrCodeImg + '">'
    };

    console.log(4)

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.send({
            errorqr: error
          })
        }
    });

    console.log(5)

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
      'SELECT id_seat as id FROM RESERVATIONS '+
      'WHERE reservation_date = $1 ' +
      'AND status = $2', 
      [date, 'RESERVED'])
    var availableSeats = allSeats.rows.filter(item1 => {
      return !reservedSeats.rows.some(item2 => {
        return item1.id === item2.id;
      });
    });
    var seatsArray = []
    reservedSeats.rows.map(item => {
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
      seats: seatsArray.sort((a, b) => a.id > b.id ? 1 : -1)
    })
  } catch (err) {
    res.send({
      error: err
    })
  }
})

app.get('/four-days-seats-data', async function (req, res, next) {
  try {
    var dayOne = await getSeatsStatusByDate(moment().format())
    var dayTwo = await getSeatsStatusByDate(moment().add(1, "days"))
    var dayThree = await getSeatsStatusByDate(moment().add(2, "days"))
    var dayFour = await getSeatsStatusByDate(moment().add(3, "days"))
    
    var allFourDaySeats = []
    allFourDaySeats.push(dayOne)
    allFourDaySeats.push(dayTwo)
    allFourDaySeats.push(dayThree)
    allFourDaySeats.push(dayFour)
    res.send({
      seats: allFourDaySeats
    })
  } catch (err) {
    res.send({
      error: err
    })
  }
})
