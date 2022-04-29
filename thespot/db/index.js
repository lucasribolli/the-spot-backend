const { Pool } = require('pg')
const db = require('../config/db')

var connectionString = db.postgresUri;
const pool = new Pool({
  connectionString
})

module.exports = {
  async query(text, params) {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('executed query', { text, duration, rows: res.rowCount })
    return res
  },
  async getClient() {
    const client = await pool.connect()
    return client
  }
}