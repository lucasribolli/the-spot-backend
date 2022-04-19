import pg from "pg"
import db from "../config/db.js"

var connectionString = db.postgresUri;
const pool = new pg.Pool({
  connectionString
})

const dataBase = {
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

export default dataBase