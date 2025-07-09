require('dotenv').config();
const { Pool } = require('pg'); // Using Pool instead of Client
const express = require('express');
const axios = require('axios');
const fetch = require('node-fetch');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();
app.use(express.json());

// Neon PostgreSQL connection pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 1, // Important for serverless - limit connections
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 2000 // Fail fast if can't connect
});

// Database middleware - attaches a client to each request
router.use(async (req, res, next) => {
  try {
    const client = await pool.connect();
    req.db = {
      query: (text, params) => client.query(text, params),
      release: () => client.release()
    };
    
    // Ensure connection is released when response finishes
    res.on('finish', () => {
      try {
        if (req.db && req.db.release) {
          req.db.release();
        }
      } catch (err) {
        console.error('Error releasing connection:', err);
      }
    });
    
    next();
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Test endpoint
router.get('/', (req, res) => {
  res.send('Backend is live');
});

// Compute distance endpoint
router.post('/computeDistance', async (req, res) => {
  const { origin, destination } = req.body;
  try {
    const response = await axios.post(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        origin: { location: { latLng: origin } },
        destination: { location: { latLng: destination } },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        languageCode: "en-US",
        units: "METRIC"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters'
        },
        timeout: 2000
      }
    );
    
    const route = response.data.routes[0];
    res.json({
      distance: route.distanceMeters,
      duration: route.duration
    });
  } catch (error) {
    console.error("Distance API error:", error.message);
    res.status(504).json({
      distance: Infinity,
      duration: null,
      error: "Distance computation timed out or failed."
    });
  }
});

// User data endpoints
router.get('/fetchbyUsername/:username', async (req, res) => {
  try {
    const result = await req.db.query(
      "SELECT * FROM login WHERE username = $1",
      [req.params.username]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).send("User not found");
    }
    
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.get('/fetchbyEmail/:email', async (req, res) => {
  try {
    const result = await req.db.query(
      "SELECT * FROM login WHERE email = $1",
      [req.params.email]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).send("Email not found");
    }
    
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// Carpark data endpoints
router.get('/fetchCarparkData/:id', async (req, res) => {
  try {
    const result = await req.db.query(
      "SELECT * FROM carpark_info WHERE id = $1",
      [req.params.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).send("Carpark info not found");
    }
    
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// Current time endpoint
router.get('/getCurrentTime', async (req, res) => {
  try {
    const result = await req.db.query(
      "SELECT MAX(recorded_at) AS latest_time FROM carpark_availability_history"
    );
    
    if (result.rowCount === 0) {
      return res.status(404).send("Cannot get latest time");
    }
    
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// Registration endpoint
router.post('/register', async (req, res) => {
  const { username, email, password, is_staff, season_pass, season_pass_type } = req.body;
  
  try {
    await req.db.query("BEGIN");
    
    // Insert into login table
    await req.db.query(
      "INSERT INTO login VALUES($1, $2, $3)",
      [username, email, password]
    );
    
    // Insert into user_info table
    await req.db.query(
      "INSERT INTO user_info VALUES($1, $2, $3, $4)",
      [username, is_staff, season_pass, season_pass_type]
    );
    
    await req.db.query("COMMIT");
    res.status(200).send("User registered successfully");
  } catch (err) {
    await req.db.query("ROLLBACK");
    console.error("Registration error:", err);
    res.status(500).send("Registration failed");
  }
});

app.use('/api', router);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Serverless handler
module.exports.handler = serverless(router);