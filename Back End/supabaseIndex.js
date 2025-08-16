require('dotenv').config()
const { Client, Pool } = require('pg')
const express = require('express')
const axios = require('axios')
const { spawn } = require('child_process')
const fetch = require('node-fetch');
const nodemailer = require("nodemailer");
const { createClient } = require('@supabase/supabase-js')
const multer = require('multer')
const port = process.env.PORT || 3000


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
const upload = multer()

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


app.get('/supa', async (req, res) => {
  const { data, error } = await supabase
    .from('carpark_info')
    .select('*')

  res.send(data)
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

app.get('/fetchUserData/:username', async (req, res) => {
  console.log("called")
  const username = req.params.username;
  console.log(username)

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)

    if (error) return res.status(500).send(error.message);
    if (!data) return res.status(404).send("User info not found");

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});


app.get('/fetchUserDataEmail/:email', async (req, res) => {
  const email = req.params.email;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)

    if (error) {
      console.error(error);
      return res.status(500).send(error.message);
    }

    if (!data) {
      return res.status(404).send("User info not found");
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

app.get('/fetchCarparkData/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const { data, error } = await supabase
      .from('carpark_info')
      .select('*')
      .eq('id', id)

    if (error) return res.status(500).send(error.message);
    if (!data) return res.status(404).send("Carpark info not found");

    console.log("Carpark info extracted");
    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
});

app.get('/fetchCarparkHistory/:id/:startTime/:endTime', async (req, res) => {
  const { id, startTime, endTime } = req.params;

  try {
    const { data, error } = await supabase
      .from('carpark_availability_history')
      .select('available, timestamp')
      .eq('carpark_id', id)
      .gte('timestamp', new Date(Number(startTime) * 1000).toISOString())
      .lte('timestamp', new Date(Number(endTime) * 1000).toISOString())
      .order('timestamp', { ascending: true });

    if (error) return res.status(500).send(error.message);
    if (!data || data.length === 0) return res.status(404).send("Carpark availability history not found");

    console.log("Carpark availability extracted");
    return res.status(200).json(data);

  } catch (err) {
    console.error('Error fetching carpark history:', err);
    return res.status(500).send("Internal server error");
  }
});


app.get('/getCurrentTime', async (req, res) => {
  console.log("Fetching time");

  try {
    const { data, error } = await supabase
      .from('carpark_availability_history')
      .select('timestamp')
      .eq('carpark_id', 1)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) return res.status(500).send(error.message);
    if (!data || data.length === 0) return res.status(404).send("Cannot get latest time");

    console.log("Latest time extracted");
    return res.status(200).json({ latest_time: data[0].timestamp });

  } catch (err) {
    console.error('Error fetching latest time:', err);
    return res.status(500).send("Internal server error");
  }
});


app.get('/getAllHistoricalData/:id', async (req, res) => {
  console.log("Fetching all historical carpark data");

  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('carpark_availability_history')
      .select('timestamp, available')
      .eq('carpark_id', id)
      .order('timestamp', { ascending: true });

    if (error) return res.status(500).send(error.message);
    if (!data || data.length === 0) return res.status(404).send("No carpark availability info");

    console.log("All historical data obtained");
    return res.status(200).json(data);

  } catch (err) {
    console.error("Error fetching historical data:", err);
    return res.status(500).send("Internal server error");
  }
});

app.post('/getAvailabilityForecast/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const { data: carparkAvailData, error } = await supabase
      .from('carpark_availability_history')
      .select('timestamp, available')
      .eq('carpark_id', id)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error("Supabase query error:", error);
      return res.status(500).json({ error: 'Database query failed', details: error.message });
    }

    console.log("Historical rows received:", carparkAvailData.length);
    if (!carparkAvailData || carparkAvailData.length === 0) {
      return res.status(404).json({ error: "No historical data available" });
    }

    const predictRes = await fetch(`${process.env.PYTHON_API_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carparkAvailData),
    });

    if (!predictRes.ok) {
      const errorText = await predictRes.text();
      return res.status(500).json({ error: 'Flask API error', details: errorText });
    }

    const forecast = await predictRes.json();
    return res.json(forecast);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message || error.toString(),
    });
  }
});

app.post('/newRegister', async (req, res) => {
  const { username, email, password, is_staff, season_pass, season_pass_type } = req.body;
  console.log(req.body)

  const { data } = await supabase
    .from("profiles")
    .select('username')
    .eq('username', username)

  if (data.length !== 0) {
    return res.status(409).send("Username already exists");
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        username: username,
        is_staff: is_staff,
        season_pass: season_pass,
        season_pass_type: season_pass_type
      }
    }
  })

  console.log(session)


  if (error) {
    if (error.code === 'email_exists') {
      return res.status(409).send("Email already exists")
    }
    else if (error.code === 'weak_password') {
      return res.status(422).send("Password too weak")
    }
    else {
      return res.status(500).send("Registration Failed")
    }
  }

  return res.status(200).send("Successfully registered")

})


app.post('/register', async (req, res) => {
  const { username, email, password, is_staff, season_pass, season_pass_type } = req.body;

  const { error } = await supabase.rpc('register_user', {
    input_username: username,
    input_email: email,
    input_password: password,
    input_is_staff: is_staff,
    input_season_pass: season_pass,
    input_season_pass_type: season_pass_type,
  });

  if (error) {
    console.error('Registration RPC failed:', error.message);

    if (error.code === 23505) {
      if (error.message.includes('username')) {
        return res.status(409).send("Username already exists");
      } else if (error.message.includes('email')) {
        return res.status(409).send("Email already exists");
      }
    }

    return res.status(500).send("Registration failed");
  }

  return res.status(200).send("User registered successfully");
});



app.post('/getUserProfilePic', async (req, res) => {
  const { imagePath } = req.body;

    const { data} = supabase.storage
      .from("avatars")
      .getPublicUrl(imagePath);

    if (!data || !data.publicUrl) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.json({ publicUrl: data.publicUrl });

});


app.put('/updateProfilePic/:username', async (req, res) => {
  const { username } = req.params;
  const { imagePath } = req.body;


  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: imagePath })
      .eq('username', username)
      .select();

    if (error) {
      console.error("Error updating profile image:", error.message);
      return res.status(500).send("Internal server error");
    }

    if (!data || data.length === 0) {
      return res.status(404).send("User not found");
    }

    return res.status(200).send("Image updated");

  } catch (err) {
    console.error("Unexpected error updating profile image:", err);
    return res.status(500).send("Internal server error");
  }
});

app.post('/storeImage', upload.single("image"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "No image" })


  try {
    const fileExt = req.file.originalname?.split('.').pop()?.toLowerCase() ?? 'jpeg'
    const path = `${Date.now()}.${fileExt}`

    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, req.file.buffer, {
        contentType: req.file.mimeType ?? 'image/jpeg',
      })

    if (uploadError) {
      throw uploadError
    }

    return res.json({ path: data.path })

  } catch (error) {
    console.error("Upload error:", err.message)
    res.status(500).json({ error: err.message })
  }
})





app.get('/getSeasonApplication', async (req, res) => {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  try {
    const { data, error } = await supabase
      .from('season_parking_applications')
      .select('*');

    if (error) {
      console.error('Supabase error in /getSeasonApplication:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve season parking applications.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error in /getSeasonApplication:', err);
    return res.status(500).json({
      success: false,
      message: 'Unexpected server error.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});


app.get('/getCappedApplication', async (req, res) => {

  try {
    const { data, error } = await supabase
      .from('capped_parking_applications')
      .select('*');

    if (error) {
      console.error('Supabase error in /getCappedApplication:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve capped parking applications.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error in /getCappedApplication:', err);
    return res.status(500).json({
      success: false,
      message: 'Unexpected server error.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});


app.post('/approveSeasonApplication', async (req, res) => {
  const { email, season_pass_type } = req.body;

  const { error } = await supabase.rpc('approve_season_application', {
    input_email: email,
    input_season_pass_type: season_pass_type,
  });

  if (error) {
    console.error('RPC error in /approveSeasonApplication:', error.message);
    return res.status(500).json({
      error: 'RPC failed',
      details: error.message,
    });
  }

  return res.status(200).json({ message: 'Season pass approved and application deleted.' });
});

app.post('/rejectSeasonApplication', async (req, res) => {
  const { email } = req.body;

  const { error } = await supabase.rpc('reject_season_application', {
    input_email: email,
  });

  if (error) {
    const isNotFound = error.message.includes('No application found');
    return res.status(isNotFound ? 404 : 500).json({
      error: 'Failed to reject season application',
      details: error.message,
    });
  }

  return res.status(200).json({ message: 'Season pass rejected and application deleted.' });
});


app.post('/resetSeasonStatus', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const { data, error, count } = await supabase
    .from('profiles')
    .update({ season_application_status: null })
    .eq('email', email)
    .select('email', { count: 'exact' }); // allows rowCount checking

  if (error) {
    console.error('Error resetting season status:', error.message);
    return res.status(500).json({ error: 'Failed to reset season status', details: error.message });
  }

  if (count === 0) {
    return res.status(404).json({ error: 'No user found with that email' });
  }

  return res.status(200).json({ message: 'Season status reset successfully' });
});


app.post('/endSeason', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  const { data, error, count } = await supabase
    .from('profiles')
    .update({
      season_pass: false,
      season_pass_type: null
    })
    .eq('email', email)
    .select('email', { count: 'exact' });

  if (error) {
    console.error('Error ending season parking:', error.message);
    return response.status(500).json({ error: 'Failed to end season parking' });
  }

  if (count === 0) {
    return response.status(404).json({ error: 'No user found with that email' });
  }

  return response.status(200).json({ message: 'Season parking ended successfully' });
});


app.post('/checkSeasonStatus', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('season_pass, season_pass_type')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Error checking season status:', error.message);
    return response.status(500).json({ error: 'Failed to check season status' });
  }

  if (!data) {
    return response.status(404).json({ error: 'No user found with that email' });
  }

  if (data.season_pass === false) {
    return response.status(201).json({ season: false });
  }

  return response.status(200).json({
    season: true,
    season_pass_type: data.season_pass_type,
  });
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

  const { error, count } = await supabase
    .from('season_parking_applications')
    .delete({ count: 'exact' })
    .eq('email', email);

  if (error) {
    console.error('Error deleting season application:', error.message);
    return response.status(500).json({ error: 'Failed to delete season application' });
  }

  if (count === 0) {
    return response.status(404).json({ error: 'No application found for this email' });
  }

  return response.status(200).json({ message: 'Season parking application deleted successfully.' });
});


app.post('/approveCappedApplication', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  const { error } = await supabase
    .rpc('approve_capped_application', { user_email: email });

  if (error) {
    console.error('RPC error in /approveCappedApplication:', error.message);
    return response.status(500).json({ error: 'Failed to approve capped application' });
  }

  return response.status(200).json({ message: 'Capped pass approved and application deleted' });
});


app.post('/rejectCappedApplication', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  try {
    const { error } = await supabase.rpc('reject_capped_application', { user_email: email });

    if (error) {
      if (error.message.includes('No application found')) {
        return response.status(404).json({ error: error.message });
      }
      throw error;
    }

    return response.status(200).json({ message: 'Capped pass rejected and application deleted.' });
  } catch (err) {
    console.error('Error in /rejectCappedApplication:', err);
    return response.status(500).json({ error: 'Failed to reject capped application' });
  }
});


app.post('/resetCappedStatus', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  try {
    const { data, error, count } = await supabase
      .from('profiles')
      .update({ capped_application_status: null })
      .eq('email', email)
      .select('email', { count: 'exact' });

    if (error) {
      console.error('Supabase error:', error);
      return response.status(500).json({ error: 'Failed to reset capped status' });
    }

    if (count === 0) {
      return response.status(404).json({ error: 'No user found with that email' });
    }

    return response.status(200).json({ message: 'Capped status reset successfully' });

  } catch (err) {
    console.error('Unexpected error:', err);
    return response.status(500).json({ error: 'Server error resetting capped status' });
  }
});



app.post('/endCapped', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  try {
    const { data, error, count } = await supabase
      .from('profiles')
      .update({ capped_pass: false })
      .eq('email', email)
      .select('email', { count: 'exact' });

    if (error) {
      console.error('Supabase error:', error);
      return response.status(500).json({ error: 'Failed to end capped parking' });
    }

    if (count === 0) {
      return response.status(404).json({ error: 'No user found with that email' });
    }

    return response.status(200).json({ message: 'Capped parking ended successfully' });

  } catch (err) {
    console.error('Unexpected error:', err);
    return response.status(500).json({ error: 'Server error ending capped parking' });
  }
});



app.post('/checkCappedStatus', async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }

  try {
    const { data, error } = await supabase
      .from('user_info')
      .select('capped_pass')
      .eq('email', email)
      .single(); // get exactly one row

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return response.status(404).json({ error: 'No user found with that email' });
      }
      console.error('Supabase error:', error);
      return response.status(500).json({ error: 'Failed to check capped status' });
    }

    if (data.capped_pass === false) {
      return response.status(201).json({ capped: false });
    } else {
      return response.status(200).json({ capped: true });
    }

  } catch (err) {
    console.error('Unexpected error:', err);
    return response.status(500).json({ error: 'Server error checking capped status' });
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

  try {
    const { data, error, count } = await supabase
      .from('capped_parking_applications')
      .delete()
      .eq('email', email)
      .select('id', { count: 'exact' }); // select is required for count

    if (error) {
      console.error('Supabase error:', error);
      return response.status(500).json({ error: 'Failed to delete capped application' });
    }

    if (count === 0) {
      return response.status(404).json({ error: 'No application found for this email' });
    }

    return response.status(200).json({ message: 'Application deleted successfully' });
  } catch (err) {
    console.error('Unexpected error:', err);
    return response.status(500).json({ error: 'Server error deleting capped application' });
  }
});

app.post('/applySeasonParking', async (request, response) => {
  const {
    salutation, name, address, studentNo, faculty, email, tel,
    vehicleRegNo, iuNo, vehicleOwner, relationship, engineCapacity, parkingType
  } = request.body;

  try {
    const { data, error } = await supabase.rpc('apply_season_parking', {
      salutation,
      name,
      address,
      student_no: studentNo,
      faculty,
      email,
      tel,
      vehicle_reg_no: vehicleRegNo,
      iu_no: iuNo,
      vehicle_owner: vehicleOwner,
      relationship,
      engine_capacity: engineCapacity,
      parking_type: parkingType,
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      return response.status(500).json({ success: false, error: 'Application failed' });
    }

    return response.status(201).json({
      success: true,
      data,
      message: 'Season application submitted and status updated'
    });
  } catch (err) {
    console.error('Unexpected server error:', err);
    return response.status(500).json({ success: false, error: 'Unexpected error' });
  }
});


// for storing capped parking
app.post('/applyCappedParking', async (request, response) => {
  const {
    salutation, name, address, email, tel,
    vehicleRegNo, iuNo, vehicleOwner, relationship, engineCapacity
  } = request.body;

  try {
    const { data, error } = await supabase.rpc('apply_capped_parking', {
      salutation,
      name,
      address,
      email,
      tel,
      vehicle_reg_no: vehicleRegNo,
      iu_no: iuNo,
      vehicle_owner: vehicleOwner,
      relationship,
      engine_capacity: engineCapacity
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      return response.status(500).json({ success: false, error: 'Application failed' });
    }

    return response.status(201).json({
      success: true,
      data,
      message: 'Capped application submitted and status updated'
    });
  } catch (err) {
    console.error('Unexpected error in /applyCappedParking:', err);
    return response.status(500).json({ success: false, error: 'Unexpected error' });
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
