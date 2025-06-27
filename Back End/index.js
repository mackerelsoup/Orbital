require('dotenv').config()
const { Client } = require('pg')
const express = require('express')
const axios = require('axios')
const { spawn } = require('child_process')
const fetch = require('node-fetch');


const app = express()
//parses incoming request 
app.use(express.json())

const connection = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

// test
app.get('/', (req, res) => {
  res.send('Backend is live');
});


//log that we are connected to the database
connection.connect().then(() => console.log("connected"))


app.post('/computeDistance', async (request, response) => {
  const { origin, destination } = request.body;
  console.log('distance here')
  try {
    const res = await axios.post(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        origin: {
          location: {
            latLng: origin
          }
        },
        destination: {
          location: {
            latLng: destination
          }
        },
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
      }
    );
    console.log("here2")
    const route = res.data.routes[0];
    response.json({
      distance: route.distanceMeters,
      duration: route.duration
    });
  } catch (error) {

  }
}
)


//:id is a route param, acts as a placeholder for any value that is part of the URL
app.get('/fetchbyUsername/:username', (request, response) => {
  const username = request.params.username
  //$1 takes the first index in an array
  const fetch_id_query = "SELECT * FROM login WHERE username = $1"
  connection.query(fetch_id_query, [username], (err, result) => {
    if (err) {
      response.send(err)
      console.error(err)
    }
    else {
      if (result.rowCount === 0) {
        response.status(404).send("User not found")
      }
      else {
        console.log("Userfound")
        response.send(result.rows)
      }

    }
  })
})

app.get('/fetchbyEmail/:email', (request, response) => {
  const email = request.params.email
  const fetch_id_query = "SELECT * FROM login WHERE email = $1"
  connection.query(fetch_id_query, [email], (err, result) => {
    if (err) {
      response.send(err)
      console.error(err)
    }
    else {
      if (result.rowCount === 0) {
        response.status(404).send("Email not found")
      }
      else {
        console.log("Email Found")
        response.send(result.rows)
      }

    }
  })
})

app.get('/fetchUserData/:username', (request, response) => {
  const username = request.params.username
  const fetch_id_query = "SELECT * FROM user_info WHERE username = $1"
  connection.query(fetch_id_query, [username], (err, result) => {
    if (err) {
      response.send(err)
      console.error(err)
    }
    else {
      if (result.rowCount === 0) {
        response.status(404).send("User info not found")
      }
      else {
        console.log("User info extracted")
        response.send(result.rows)
      }

    }
  })
})

app.get('/fetchCarparkData/:id', (request, response) => {
  const id = request.params.id
  const fetch_id_query = "SELECT * FROM carpark_info WHERE id = $1"
  connection.query(fetch_id_query, [id], (err, result) => {
    if (err) {
      response.send(err)
      console.error(err)
    }
    else {
      if (result.rowCount === 0) {
        response.status(404).send("Carpark info not found")
      }
      else {
        console.log("Carpark info extracted")
        response.send(result.rows)
      }

    }
  })
})

app.get('/fetchCarparkHistory/:id/:startTime/:endTime', (request, response) => {
  console.log("fethcding history")
  const id = request.params.id
  const startTime = request.params.startTime
  const endTime = request.params.endTime
  const fetch_id_query = "SELECT * FROM carpark_availability_history WHERE carpark_id = $1 AND recorded_at >= to_timestamp($2) AND recorded_at <= to_timestamp($3) ORDER BY recorded_at ASC"
  connection.query(fetch_id_query, [id, startTime, endTime], (err, result) => {
    if (err) {
      response.send(err)
      console.error(err)
    }
    else {
      if (result.rowCount === 0) {
        response.status(404).send("Carpark availability history not found")
      }
      else {
        console.log("Carpark availability extracted")
        response.send(result.rows)
      }

    }
  })
})

app.get('/fetchCarparkHistoryDemo/:id/:startTime/:endTime', (request, response) => {
  console.log("fethcding history")
  const id = request.params.id
  const startTime = request.params.startTime
  const endTime = request.params.endTime
  const fetch_id_query = "SELECT available, recorded_at FROM temp_carpark_avail WHERE carpark_id = $1 AND recorded_at >= to_timestamp($2) AND recorded_at <= to_timestamp($3) ORDER BY recorded_at ASC"
  connection.query(fetch_id_query, [id, startTime, endTime], (err, result) => {
    if (err) {
      response.send(err)
      console.error(err)
    }
    else {
      if (result.rowCount === 0) {
        response.status(404).send("Carpark availability history not found")
      }
      else {
        console.log("Carpark availability extracted")
        response.send(result.rows)
      }

    }
  })
})


app.get('/getCurrentTime', (request, response) => {
  console.log("fetching time")
  const fetch_id_query = "SELECT MAX(recorded_at) AS latest_time FROM carpark_availability_history"
  connection.query(fetch_id_query, (err, result) => {
    if (err) {
      response.send(err)
      console.error(err)
    }
    else {
      if (result.rowCount === 0) {
        response.status(404).send("Cannot get latest time")
      }
      else {
        console.log("Latest time extracted")
        response.send(result.rows)
      }

    }
  })
})

app.get('/getCurrentTimeDemo', (request, response) => {
  console.log("fetching time")
  const fetch_id_query = "SELECT MAX(recorded_at) AS latest_time FROM temp_carpark_avail"
  connection.query(fetch_id_query, (err, result) => {
    if (err) {
      response.send(err)
      console.error(err)
    }
    else {
      if (result.rowCount === 0) {
        response.status(404).send("Cannot get latest time")
      }
      else {
        console.log("Latest time extracted")
        response.send(result.rows)
      }

    }
  })
})

app.get('/getAllHistoricalDataDemo/:id', (request, response) => {
  console.log("fecthing time")
  const id = request.params.id
  const fetch_id_query = "SELECT to_char(recorded_at, 'YYYY-MM-DD HH24:MI:SS') AS recorded_at, available FROM temp_carpark_avail WHERE carpark_id = $1 ORDER BY recorded_at ASC"
  connection.query(fetch_id_query, [id], (err, result) => {
    if (err) {
      response.send(err)
      console.error(err)
    }
    else {
      if (result.rowCount === 0) {
        response.status(404).send("No carpark avail info ")
      }
      else {
        console.log("all historical data obtained")
        response.send(result.rows)
      }

    }
  })
})

app.post('/getAvailabilityForecastDemo/:id', async (request, response) => {
  console.log("predicting avail");
  const id = request.params.id;

  try {
    const res = await fetch(`https://orbital-1-9fo5.onrender.com/getAllHistoricalDataDemo/${id}`);
    if (!res.ok) {
      return response.status(res.status).json({ error: `Failed to fetch carpark data: ${res.statusText}` });
    }

    const carparkAvailData = await res.json();

    // Step 2: Send to Flask prediction API
    const predictRes = await fetch(`${process.env.PYTHON_API_URL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carparkAvailData),
    });

    if (!predictRes.ok) {
      const errorText = await predictRes.text();
      return response.status(500).json({ error: 'Flask API error', details: errorText });
    }

    const forecast = await predictRes.json();
    return response.json(forecast);

  } catch (error) {
    console.error('Server error:', error);
    response.status(500).json({
      error: 'Internal server error',
      details: error.message || error.toString(),
    });
  }
});

// app.post('/getAvailabilityForecastDemo/:id', async (request, response) => {
//   console.log("predicting avail");
//   const id = request.params.id;

//   try {
//     // Fetch historical carpark data
//     const res = await fetch(`https://orbital-1-9fo5.onrender.com/getAllHistoricalDataDemo/${id}`);
//     if (!res.ok) {
//       // console.log("failed to fetch carpark data");
//       return response.status(res.status).json({ error: `Failed to fetch carpark data: ${res.statusText}` });
//     }

//     const carparkAvailData = await res.json();;

//     // Spawn python process
//     const py = spawn('python3', ['./scripts/Carpark Availability Prediction Script.py']);

//     console.log("spawned")

//     let forecast = '';
//     let errorOutput = '';

//     // Collect data from python stdout
//     py.stdout.on('data', (data) => {
//       forecast += data.toString();
//     });

//     // Collect data from python stderr
//     py.stderr.on('data', (err) => {
//       errorOutput += err.toString();
//     });

//     // When python finishes
//     py.on('close', (code) => {
//       console.log(`Python process exited with code ${code}`);

//       if (errorOutput) {
//         console.error("Python stderr:", errorOutput);
//       }

//       if (code !== 0) {
//         return response.status(500).json({
//           error: 'Python script error',
//           details: errorOutput || 'Unknown error'
//         });
//       }

//       try {
//         console.log("Python stdout:", forecast);
//         const forecastJson = JSON.parse(forecast);
//         return response.json(forecastJson);
//       } catch (parseErr) {
//         console.error('Error parsing JSON from python:', parseErr);
//         return response.status(500).json({
//           error: 'Invalid JSON output from python',
//           rawOutput: forecast
//         });
//       }
//     });

//     // Send JSON input to python stdin
//     py.stdin.write(JSON.stringify(carparkAvailData));
//     py.stdin.end();

//   } catch (error) {
//     console.error('Server error:', error);
//     response.status(500).json({ error: 'Internal server error' });
//   }
// });

app.post('/register', (request, response) => {
  const { username, email, password, is_staff, season_pass, season_pass_type } = request.body;
  const login_update_query = "INSERT INTO login VALUES($1, $2, $3)";
  const user_info_update_query = "INSERT INTO user_info VALUES($1, $2, $3, $4)"

  connection.query(login_update_query, [username, email, password], (err, result) => {
    if (err) {
      console.error("log info update failed", err)
      response.status(500).send("Login info update failed")
    }
    else {
      connection.query(user_info_update_query, [username, is_staff, season_pass, season_pass_type], (err, result) => {
        if (err) {
          console.error("user info update failed", err)
          response.status(500).send("User info update failed");
        }
      })
      response.status(200).send("User registered successfully");
    }
  })

})



app.put('/update/:id', (request, response) => {
  const id = request.params.id
  const name = request.body.name

  const update_query = "UPDATE demotable SET name = $1 WHERE id = $2"
  connection.query(update_query, [name, id], (err, result) => {
    if (err) {
      response.send(err)
      console.error(err)
    }
    else {
      response.send("Value updated")
    }
  })
})

app.delete('/delete/:id', (request, response) => {
  const id = request.params.id

  const delete_query = "DELETE FROM demotable WHERE id = $1"
  connection.query(delete_query, [id], (err, result) => {
    if (err) {
      response.send(err)
      console.error(err)
    }
    else {
      response.send(result)
    }
  })
})

// for storing season parking form data
app.post('/applySeasonParking', (request, response) => {
  const {
    salutation, name, address, studentNo, faculty, email, tel, vehicleRegNo, iuNo, vehicleOwner, relationship, engineCapacity, parkingType
  } = request.body;

  const query = `
    INSERT INTO season_parking_applications (
      salutation, name, address, student_no, faculty, email, tel, vehicle_reg_no, iu_no, vehicle_owner, relationship, engine_capacity, parking_type
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *
  `;

  const values = [
    salutation, name, address, studentNo, faculty, email, tel, vehicleRegNo, iuNo, vehicleOwner, relationship, engineCapacity, parkingType
  ];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.log("error in season parking");
      console.error(err);
      return response.status(500).json({ success: false, error: 'Database error' });
    }
    response.status(201).json({ success: true, data: result.rows[0] });
  });
});

// for storing capped parking
app.post('/applyCappedParking', (request, response) => {
  const {
    salutation, name, address, email, tel, vehicleRegNo, iuNo, vehicleOwner, relationship, engineCapacity
  } = request.body;

  const query = `
    INSERT INTO capped_parking_applications (
      salutation, name, address, email, tel, vehicle_reg_no, iu_no, vehicle_owner, relationship, engine_capacity
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
  `;

  const values = [
    salutation, name, address, email, tel, vehicleRegNo, iuNo, vehicleOwner, relationship, engineCapacity
  ];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.log("error in capped parking");
      console.error(err);
      return response.status(500).json({ success: false, error: 'Database error' });
    }
    response.status(201).json({ success: true, data: result.rows[0] });
  });
});

app.listen(3000, () => {
  console.log("server is running")
})
