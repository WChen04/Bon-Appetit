const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'softwaredd',
  port: 5432,
})

const getRestaurants = (request, response) => {

  pool.query('SELECT id, name, rating, latitude, longitude, price FROM restaurants', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}