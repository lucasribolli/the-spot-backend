const express = require('express')
var bodyParser = require('body-parser')
const cors = require('cors')
const db = require('./db/index')
const responses = require('./utils/responses')

var app = express()
app.use(cors())
app.use(bodyParser.json())
PORT = process.env.PORT || 4000

app.set('port', PORT)
app.listen(PORT, function () {
  console.log('Server is running...')
})

app.get('/auth', function (req, res, next) {
  try {
    var response = new Object()
    response.authorized = true
    res.send(response)
  } catch (err) {
    res.send(responses.fail(err))
  }
})