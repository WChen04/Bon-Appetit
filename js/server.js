const express = require("express");
const axios = require("axios");
const cors = require("cors");
//const db = require('./queries')

const app = express();
const port = 3000;

// Use CORS middleware to allow requests from your frontend
app.use(cors());

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

// Replace 'YOUR_API_KEY' with your actual Yelp API key
const API_KEY =
  "-Egw2L5k2bsQ81PTQAlSsmzL4WftxAsumCCOBxLB4-O3u4jELtnTuDRdhEpFqdu2STHSxeoLZaCwB-geX0gl4gep1_hmlWaXxXLlQDPn_XLxD40RoK28zUvPEwNeZnYx";

app.get("/api/yelp", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.yelp.com/v3/businesses/search",
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        params: {
          term: req.query.term || "food",
          location: req.query.location || "Albany",
          limit: req.query.limit || 100,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', getRestaurants)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});