require('dotenv').config()
const { Client, Pool } = require('pg')
const express = require('express')
const axios = require('axios')
const { spawn } = require('child_process')
const fetch = require('node-fetch');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const app = express()
//parses incoming request 
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
})

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
//connection.connect().then(() => console.log("connected"))


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
        timeout: 2000
      }
    );
    console.log("here2")
    const route = res.data.routes[0];
    response.json({
      distance: route.distanceMeters,
      duration: route.duration
    });
  } catch (error) {
    console.error("Distance API error:", error.message);

    // Optional: Respond with default values or indicate timeout
    response.status(504).json({
      distance: Infinity,
      duration: null,
      error: "Distance computation timed out or failed."
    });
  }
}
)


//:id is a route param, acts as a placeholder for any value that is part of the URL
app.get('/fetchbyUsername/:username', async (request, response) => {
  const username = request.params.username

  const fetch_id_query = "SELECT * FROM login WHERE username = $1"

  try {
    const fetchResult = await pool.query(fetch_id_query, [username])

    if (fetchResult.rowCount === 0) {
      return response.status(404).send("User not found")
    }
    return response.status(200).send(fetchResult.rows)

  } catch (err) {
    console.error(err)
    return response.status(500).send(err)

  }

})

app.get('/fetchbyEmail/:email', async (request, response) => {
  const email = request.params.email
  const fetch_id_query = "SELECT * FROM login WHERE email = $1"

  try {
    const fetchResult = await pool.query(fetch_id_query, [username])

    if (fetchResult.rowCount === 0) {
      return response.status(404).send("Email not found")
    }
    return response.status(200).send(fetchResult.rows)

  } catch (err) {
    console.error(err)
    return response.status(500).send(err)

  }

})

app.get('/fetchUserData/:username', async (request, response) => {
  const username = request.params.username
  const fetch_id_query = "SELECT * FROM user_info WHERE username = $1"
  try {
    const fetchResult = await pool.query(fetch_id_query, [username])

    if (fetchResult.rowCount === 0) {
      return response.status(404).send("User info not found")
    }
    return response.status(200).send(fetchResult.rows)

  } catch (err) {
    console.error(err)
    return response.status(500).send(err)

  }
})

app.get('/fetchUserDataEmail/:email', async (request, response) => {
  const email = request.params.email
  console.log(email)
  const fetch_id_query = "SELECT * FROM user_info WHERE email = $1"
  try {
    const fetchResult = await pool.query(fetch_id_query, [email])

    if (fetchResult.rowCount === 0) {
      return response.status(404).send("User info not found")
    }
    return response.status(200).send(fetchResult.rows)

  } catch (err) {
    console.error(err)
    return response.status(500).send(err)

  }
})

app.get('/fetchCarparkData/:id', async (request, response) => {
  const id = request.params.id
  const fetch_id_query = "SELECT * FROM carpark_info WHERE id = $1"

  try {
    const fetchResult = await pool.query(fetch_id_query, [id])
    if (fetchResult.rowCount === 0) {
      return response.status(404).send("Carpark info not found")
    }
    console.log("Carpark info extracted")
    return response.status(200).send(fetchResult.rows)

  } catch (err) {
    console.error(err)
    return response.status(500).send(err)
  }

})

app.get('/fetchCarparkHistory/:id/:startTime/:endTime', async (request, response) => {
  const { id, startTime, endTime } = request.params;

  const fetch_id_query = `
    SELECT available, timestamp
    FROM carpark_availability_history
    WHERE carpark_id = $1
      AND timestamp >= to_timestamp($2)
      AND timestamp <= to_timestamp($3)
    ORDER BY timestamp ASC
  `;

  try {
    const result = await pool.query(fetch_id_query, [id, startTime, endTime]);

    if (result.rowCount === 0) {
      return response.status(404).send("Carpark availability history not found");
    }

    console.log("Carpark availability extracted");
    return response.status(200).json(result.rows);

  } catch (err) {
    console.error('Error fetching carpark history:', err);
    return response.status(500).send("Internal server error");
  }
});



app.get('/getCurrentTime', async (request, response) => {
  console.log("Fetching time");

  const fetch_id_query = `
    SELECT MAX(timestamp) AS latest_time
    FROM carpark_availability_history
    WHERE carpark_id = 1
  `;

  try {
    const result = await pool.query(fetch_id_query);

    if (result.rowCount === 0 || !result.rows[0].latest_time) {
      return response.status(404).send("Cannot get latest time");
    }

    console.log("Latest time extracted");
    return response.status(200).json(result.rows[0]); // returns single row as object

  } catch (err) {
    console.error('Error fetching latest time:', err);
    return response.status(500).send("Internal server error");
  }
});

app.get('/getAllHistoricalData/:id', async (request, response) => {
  console.log("Fetching all historical carpark data");

  const { id } = request.params;
  const fetch_id_query = `
    SELECT timestamp, available
    FROM carpark_availability_history
    WHERE carpark_id = $1
    ORDER BY timestamp ASC
  `;

  try {
    const result = await pool.query(fetch_id_query, [id]);

    if (result.rowCount === 0) {
      return response.status(404).send("No carpark availability info");
    }

    console.log("All historical data obtained");
    return response.status(200).json(result.rows);

  } catch (err) {
    console.error("Error fetching historical data:", err);
    return response.status(500).send("Internal server error");
  }
});


app.post('/getAvailabilityForecast/:id', async (request, response) => {
  const id = request.params.id;

  try {
    const fetchQuery = `
      SELECT timestamp, available
      FROM carpark_availability_history
      WHERE carpark_id = $1
      ORDER BY timestamp ASC
    `;
    const result = await pool.query(fetchQuery, [id]);

    const carparkAvailData = result.rows;

    console.log("Historical rows received:", carparkAvailData.length);
    if (carparkAvailData.length === 0) {
      return response.status(404).json({ error: "No historical data available" });
    }


    // Step 2: Send to Python prediction API
    const predictRes = await fetch(`${process.env.PYTHON_API_URL}`, {
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

app.post('/register', async (request, response) => {
  console.log("Calling /register");

  const { username, email, password, is_staff, season_pass, season_pass_type } = request.body;

  const login_update_query = "INSERT INTO login VALUES($1, $2, $3)";
  const user_info_update_query = "INSERT INTO user_info VALUES($1, $2, $3, $4, $5)";
  const user_profilepic_update_query = "INSERT INTO user_profile VALUES($1, $2)";
  const defaultProfilePicUrl = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(login_update_query, [username, email, password]);
    await client.query(user_info_update_query, [username, is_staff, season_pass, season_pass_type, email]);
    await client.query(user_profilepic_update_query, [username, defaultProfilePicUrl]);

    await client.query('COMMIT');

    return response.status(200).send("User registered successfully");

  } catch (err) {
    await client.query('ROLLBACK');

    if (err.code === '23505') {
      if (err.detail.includes('username')) {
        return response.status(409).send("Username already exists");
      } else if (err.detail.includes('email')) {
        return response.status(409).send("Email already exists");
      }
    }

    console.error("Registration failed:", err);
    return response.status(500).send("Registration failed");

  } finally {
    client.release();
  }
});



app.get('/getUserProfilePic/:username', async (request, response) => {
  const { username } = request.params;

  const pic_query = "SELECT profileuri FROM user_profile WHERE username = $1";

  try {
    const result = await pool.query(pic_query, [username]);

    if (result.rowCount === 0) {
      console.error("User not found");
      return response.status(404).send("User not found");
    }

    return response.status(200).json(result.rows); 

  } catch (err) {
    console.error("Error fetching user profile picture:", err);
    return response.status(500).send("Internal server error");
  }
});


app.put('/updateProfile/:username', async (request, response) => {
  const { username } = request.params;
  const { imageURI } = request.body;

  const update_query = "UPDATE user_profile SET profileuri = $2 WHERE username = $1";

  try {
    const result = await pool.query(update_query, [username, imageURI]);

    if (result.rowCount === 0) {
      return response.status(404).send("User not found");
    }

    return response.status(200).send("Image updated");
  } catch (err) {
    console.error("Error updating profile image:", err);
    return response.status(500).send("Internal server error");
  }
});


app.get('/getSeasonApplication', async (request, response) => {
  const application_query = "SELECT * FROM season_parking_applications";

  try {
    const result = await pool.query(application_query);
    return response.status(200).json(result.rows);
  } catch (err) {
    console.error('Database error in /getSeasonApplication:', err);

    return response.status(500).json({
      success: false,
      message: 'Failed to retrieve season parking applications.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});



app.get('/getCappedApplication', async (request, response) => {
  const application_query = "SELECT * FROM capped_parking_applications";

  try {
    const result = await pool.query(application_query);
    return response.status(200).json(result.rows);
  } catch (err) {
    console.error('Database error in /getCappedApplication:', err);

    return response.status(500).json({
      success: false,
      message: 'Failed to retrieve capped parking applications.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});


app.post('/approveSeasonApplication', async (request, response) => {
  const { email, season_pass_type } = request.body;

  const update_query = `
    UPDATE user_info
    SET season_pass = true,
        season_pass_type = $1,
        season_application_status = null
    WHERE email = $2
  `;
  const deletion_query = `
    DELETE FROM season_parking_applications
    WHERE email = $1
  `;

  const client = await pool.connect(); // start transaction with client

  try {
    await client.query('BEGIN'); // start transaction

    await client.query(update_query, [season_pass_type, email]);
    await client.query(deletion_query, [email]);

    await client.query('COMMIT'); // commit if both succeed

    response.status(200).json({ message: 'Season pass approved and application deleted.' });
  } catch (err) {
    await client.query('ROLLBACK'); // rollback on any failure
    console.error('Transaction error in /approveSeasonApplication:', err);

    response.status(500).json({
      error: 'Transaction failed',
      details: err.message,
    });
  } finally {
    client.release(); // release client back to pool
  }
});


app.post('/rejectSeasonApplication', async (request, response) => {
  const { email } = request.body;

  const update_query = `
    UPDATE user_info
    SET season_application_status = 'rejected'
    WHERE email = $1
  `;
  const deletion_query = `
    DELETE FROM season_parking_applications
    WHERE email = $1
  `;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updateResult = await client.query(update_query, [email]);

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return response.status(404).json({ error: 'No application found for this email' });
    }

    await client.query(deletion_query, [email]);

    await client.query('COMMIT');

    return response.status(200).json({ message: 'Season pass rejected and application deleted.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction error in /rejectSeasonApplication:', err);

    return response.status(500).json({
      error: 'Failed to reject season application',
      details: err.message,
    });
  } finally {
    client.release();
  }
});


app.post('/resetSeasonStatus', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  const update_query = "UPDATE user_info SET season_application_status = NULL WHERE email = $1";

  try {
    const updateResult = await pool.query(update_query, [email])

    if (updateResult.rowCount === 0) {
      return response.status(404).json({ error: 'No user found with that email' });
    }

    return response.status(200).json({ message: 'Season status reset successfully' });

  } catch (err) {
    console.error('Error resetting season status:', err);
    return response.status(500).json({ error: 'Failed to reset season status' });
  }

});

app.post('/endSeason', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  const update_query = "UPDATE user_info SET season_pass = false, season_pass_type = NULL WHERE email = $1";

  try {
    const updateResult = await pool.query(update_query, [email])

    if (updateResult.rowCount === 0) {
      return response.status(404).json({ error: 'No user found with that email' });
    }

    return response.status(200).json({ message: 'Season parking ended successfully' });
  } catch (err) {
    console.error('Error ending season parking:', err);
    return response.status(500).json({ error: 'Failed to end season parking' });
  }


});

app.post('/checkSeasonStatus', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  const check_query = "SELECT season_pass, season_pass_type FROM user_info WHERE email = $1";

  try {
    const queryResult = await pool.query(check_query, [email])

    if (queryResult.rowCount === 0) {
      return response.status(404).json({ error: 'No user found with that email' });
    }
    else if (queryResult.rows[0].season_pass === false) {
      return response.status(201).json({ season: false });
    }

    return response.status(200).json({ season: true, season_pass_type: queryResult.rows[0].season_pass_type })

  } catch (error) {
    console.error('Error ending season parking:', err);
    return response.status(500).json({ error: 'Failed to end season parking' });
  }

});

/*
app.post('/getSeasonApplicationStatus', (request, response) => {
  const { email } = request.body;

  const status_query = "SELECT status FROM season_parking_applications WHERE email = $1";

  connection.query(status_query, [email], (err, result) => {
    if (err) {
      console.error('Error querying season application status:', err);
      return response.status(500).json({ error: 'Internal server error' });
    }

    if (result.rows.length === 0) {
      return response.status(404).json({ error: 'No application found for this email' });
    }

    const status = result.rows[0].status;
    return response.status(200).json({ status });
  });
});
*/

app.post('/deleteSeasonApplication', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  const deletion_query = "DELETE FROM season_parking_applications WHERE email = $1";

  try {
    const deletionResult = await pool.query(deletion_query, [email]);

    if (deletionResult.rowCount === 0) {
      return response.status(404).json({ error: 'No application found for this email' });
    }

    return response.status(200).json({ message: 'Season parking application deleted successfully.' });
  } catch (err) {
    console.error('Error deleting season application:', err);
    return response.status(500).json({ error: 'Failed to delete season application' });
  }
});


app.post('/approveCappedApplication', async (request, response) => {
  const { email, season_pass_type } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  const deletion_query = "DELETE FROM capped_parking_applications WHERE email = $1";
  const update_query = "UPDATE user_info SET capped_pass = true, capped_application_status = null WHERE email = $1";

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const updateResult = await client.query(update_query, [email])
    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return response.status(404).json({ error: 'No user found for this email' });
    }
    await client.query(deletion_query, [email])

    await client.query('COMMIT')
    return response.status(200).json({ message: 'Capped pass approved and application deleted' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction error in /approveCappedApplication', err)
    return response.status(500).json({ error: 'Failed to approve capped application' })
  } finally {
    client.release();
  }

})

app.post('/rejectCappedApplication', async (request, response) => {
  const { email } = request.body;

  const deletion_query = "DELETE FROM capped_parking_applications WHERE email = $1";
  const update_query = "UPDATE user_info SET capped_application_status = 'rejected' WHERE email = $1";

  const client = await pool.connect()

  try {
    await client.query('BEGIN');

    const updateResult = await client.query(update_query, [email]);
    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return response.status(404).json({ error: 'No application found for this email' });
    }

    await client.query(deletion_query, [email]);

    await client.query('COMMIT');
    return response.status(200).json({ message: 'Capped pass rejected and application deleted.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction error in /rejectCappedApplication:', err);
    return response.status(500).json({ error: 'Failed to reject application' });
  } finally {
    client.release();
  }

});

app.post('/resetCappedStatus', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  const update_query = "UPDATE user_info SET capped_application_status = NULL WHERE email = $1";

  try {
    const result = await pool.query(update_query, [email])

    if (result.rowCount === 0) {
      return response.status(404).json({ error: 'No user found with that email' });
    }

    return response.status(200).json({ message: 'Capped status reset successfully' });
  } catch (error) {
    console.error('Error resetting capped status:', error);
    return response.status(500).json({ error: 'Failed to reset capped status' });
  }

});


app.post('/endCapped', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  const update_query = "UPDATE user_info SET capped_pass = false WHERE email = $1";

  try {
    const result = await pool.query(update_query, [email])

    if (result.rowCount === 0) {
      return response.status(404).json({ error: 'No user found with that email' });
    }

    return response.status(200).json({ message: 'Capped parking ended successfully' });

  } catch (error) {
    console.error('Error ending capped parking:', error);
    return response.status(500).json({ error: 'Failed to end capped parking' });
  }

});


app.post('/checkCappedStatus', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  const check_query = "SELECT capped_pass FROM user_info WHERE email = $1";

  try {
    const result = await pool.query(check_query, [email])

    if (result.rowCount === 0) {
      return response.status(404).json({ error: 'No user found with that email' });
    } else if (result.rows[0].capped_pass === false) {
      return response.status(201).json({ capped: false });
    } else {
      return response.status(200).json({ capped: true });
    }
  } catch (error) {
    console.error('Error ending capped parking:', error);
    return response.status(500).json({ error: 'Failed to end capped parking' });
  }
});


/*
app.post('/getCappedApplicationStatus', (request, response) => {
  const { email } = request.body;

  const status_query = "SELECT status FROM capped_parking_applications WHERE email = $1";

  connection.query(status_query, [email], (err, result) => {
    if (err) {
      console.error('Error querying capped application status:', err);
      return response.status(500).json({ error: 'Internal server error' });
    }

    if (result.rows.length === 0) {
      return response.status(404).json({ error: 'No application found for this email' });
    }

    const status = result.rows[0].status;
    return response.status(200).json({ status });
  });
});
*/


app.post('/deleteCappedApplication', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  const deletion_query = "DELETE FROM capped_parking_applications WHERE email = $1";

  try {
    const result = await pool.query(deletion_query, [email]);

    if (result.rowCount === 0) {
      return response.status(404).json({ error: 'No application found for this email' });
    }

    return response.status(200).json({ message: 'Application deleted successfully' });
  } catch (err) {
    console.error('Error deleting capped application:', err);
    return response.status(500).json({ error: 'Failed to delete capped application' });
  }
});



//for storing season parking data
app.post('/applySeasonParking', async (request, response) => {
  const {
    salutation, name, address, studentNo, faculty, email, tel,
    vehicleRegNo, iuNo, vehicleOwner, relationship, engineCapacity, parkingType
  } = request.body;

  const insert_query = `
    INSERT INTO season_parking_applications (
      salutation, name, address, student_no, faculty, email, tel,
      vehicle_reg_no, iu_no, vehicle_owner, relationship, engine_capacity, parking_type
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *
  `;

  const update_query = `
    UPDATE user_info SET season_application_status = 'pending' WHERE email = $1
  `;

  const values = [
    salutation, name, address, studentNo, faculty, email, tel,
    vehicleRegNo, iuNo, vehicleOwner, relationship, engineCapacity, parkingType
  ];

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insertResult = await client.query(insert_query, values);
    await client.query(update_query, [email]);

    await client.query('COMMIT');

    return response.status(201).json({
      success: true,
      data: insertResult.rows[0],
      message: 'Season application submitted and status updated'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error in /applySeasonParking:', error);
    return response.status(500).json({ success: false, error: 'Database transaction failed' });
  } finally {
    client.release();
  }
});

// for storing capped parking
app.post('/applyCappedParking', async (request, response) => {
  const {
    salutation, name, address, email, tel, vehicleRegNo,
    iuNo, vehicleOwner, relationship, engineCapacity
  } = request.body;

  const insert_query = `
    INSERT INTO capped_parking_applications (
      salutation, name, address, email, tel, vehicle_reg_no, iu_no,
      vehicle_owner, relationship, engine_capacity
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
  `;

  const update_query = `
    UPDATE user_info SET capped_application_status = 'pending' WHERE email = $1
  `;

  const values = [
    salutation, name, address, email, tel,
    vehicleRegNo, iuNo, vehicleOwner, relationship, engineCapacity
  ];

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insertResult = await client.query(insert_query, values);
    await client.query(update_query, [email]);

    await client.query('COMMIT');

    return response.status(201).json({
      success: true,
      data: insertResult.rows[0],
      message: 'Capped application submitted and status updated'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error in /applyCappedParking:', error);
    return response.status(500).json({ success: false, error: 'Database transaction failed' });
  } finally {
    client.release();
  }
});



// confirmation email
app.post('/sendConfirmationEmail', async (req, res) => {
  const { email, username, type } = req.body;

  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "NUSpots Season Parking Confirmation",
    text: `Hi ${username},\n\nThank you for applying for season parking! Your validity period will be reflected in the app once we have approved your application.\n\nBest regards,\nNUSpots`,
  };

  if (type === 'capped') {
    mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "NUSpots Vehicle Registration Confirmation",
      text: `Hi ${username},\n\nThank you for registering your vehicle! Please wait for us to approve your application. If appproved, your parking will now be capped at $2.568 per exit per day on weekdays, from 0830 to 1800 at:\n\nCP3: University Cultural Centre/Yong Siew Toh Conservatory of Music\nCP10B: Prince George's Park Residences\n\nBest regards,\nNUSpots`,
    };
  } 

  try {
    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent to", email);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
});


app.listen(3000, () => {
  console.log("server is running")
})
