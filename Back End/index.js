require('dotenv').config()
const { Client } = require('pg')
const express = require('express')
const axios = require('axios')
const { spawn } = require('child_process')

const app = express()
//parses incoming request 
app.use(express.json())

const connection = new Client()

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
    // Fetch historical carpark data
    const res = await fetch(`http://192.168.68.60:3000/getAllHistoricalDataDemo/${id}`);
    if (!res.ok) {
      return response.status(res.status).json({ error: `Failed to fetch carpark data: ${res.statusText}` });
    }

    const carparkAvailData = await res.json();;

    // Spawn python process
    const py = spawn('C:/Users/Admin/miniconda3/envs/arima-env/python.exe', ['./scripts/Carpark Availability Prediction Script.py']);

    console.log("spawned")

    let forecast = '';
    let errorOutput = '';

    // Collect data from python stdout
    py.stdout.on('data', (data) => {
      forecast += data.toString();
    });

    // Collect data from python stderr
    py.stderr.on('data', (err) => {
      errorOutput += err.toString();
    });

    // When python finishes
    py.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}, stderr: ${errorOutput}`);
        return response.status(500).json({ error: 'Python script error', details: errorOutput });
      }
      try {
        // Parse the JSON output from python
        console.log(forecast)
        const forecastJson = JSON.parse(forecast);
        return response.json(forecastJson);
      } catch (parseErr) {
        console.error('Error parsing JSON from python:', parseErr);
        return response.status(500).json({ error: 'Invalid JSON output from python' });
      }
    });

    // Send JSON input to python stdin
    py.stdin.write(JSON.stringify(carparkAvailData));
    py.stdin.end();

  } catch (error) {
    console.error('Server error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});




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


app.listen(3000, () => {
  console.log("server is running")
})
