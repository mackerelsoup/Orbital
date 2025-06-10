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
  console.log('here')
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
        }
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
