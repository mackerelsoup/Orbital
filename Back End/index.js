require('dotenv').config()
const { Client } = require('pg')
const express = require('express')
const axios = require('axios')

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
