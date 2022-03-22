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

app.get('/', async function (req, res, next) {
  try {
    var response = new Object()
    response.test = await db.query('SELECT * FROM test')
    res.send(response)
  } catch (err) {
    console.log('err -> ' + err)
    var responseError = new Object()
    responseError.error = err
    res.send(responseError)
  }
})