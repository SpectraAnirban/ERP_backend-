const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('../models/User');
const Role = require('../models/Role');
const UserDetails = require('../models/UserDetails'); // Adjust the path as necessary
const Verification = require('../models/Verification');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Middleware to parse cookies
router.use(cookieParser());

// Generate JWT tokens with 12 hours expiration
const generateAccessToken = (user) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '12h' });
};


const generateRefreshToken = (user) => {
  return jwt.sign(user, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Registration route

router.post('/register', async (req, res) => {
  const {
    username,
    password,
    email_address,
    is_active,
    name,
    reported_to,
    employee_id,
    joining_date,
    phone_no,
    department,
    designation,
    office_id,
    role_id,
    user_type
  } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user data object
    const userData = {
      username,
      password: hashedPassword,
      email_address,
      is_active: is_active !== undefined ? is_active : true,
      office_id: office_id !== undefined ? office_id : 1,
      name,
      phone_no,
      user_type
    };

    // Optional fields
    if (reported_to) userData.reported_to = reported_to;
    if (employee_id) userData.employee_id = employee_id;
    if (joining_date) userData.joining_date = joining_date;
    if (department) userData.department = department;
    if (designation) userData.designation = designation;
    if (role_id) userData.role_id = role_id;

    // Create user record
    const user = await User.create(userData);

    // Create verification record
    const verificationData = {
      user_id: user.user_id, // Use the user_id from the created user
      verifier_id: null, // Initial verifier_id is null
      verified_at: null, // Initial verified_at is null
      status: false // Initial status is false
    };

    // Create verification record in the Verification table
    await Verification.create(verificationData);

    // Create user details record
    const userDetailsData = {
      user_id: user.user_id,
      employee_id: employee_id || "NA",
      name: name || "NA",
      address: req.body.address || "NA",
      city: req.body.city || "NA",
      pincode: req.body.pincode || "NA",
      state: req.body.state || "NA",
      country: req.body.country || "NA",
      phone: phone_no || "NA",
      email_address: email_address || "NA",
      official_email_address: req.body.official_email_address || "NA",
      gender: req.body.gender || "NA",
      date_of_birth: req.body.date_of_birth || new Date(),
      forte: req.body.forte || "NA",
      other_skills: req.body.other_skills || "NA",
      pan_card_no: req.body.pan_card_no || "NA",
      passport_no: req.body.passport_no || "NA",
      aadhar_no: req.body.aadhar_no || "NA",
      nationality: req.body.nationality || "NA",
      religion: req.body.religion || "NA",
      marital_status: req.body.marital_status || "NA",
      employment_of_spouse: req.body.employment_of_spouse || "NA",
      no_of_children: req.body.no_of_children || "0"
    };

    // Create user details record in the UserDetails table
    await UserDetails.create(userDetailsData);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});



// Login route
router.post('/login', async (req, res) => {
  const { email_address, password } = req.body;
  try {
    // Find the user by email address
    const user = await User.findOne({ 
      where: { email_address },
    });

    // If user doesn't exist or password doesn't match, return invalid credentials
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user account is active
    if (!user.is_active) {
      return res.status(400).json({ message: 'User account is not active' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Fetch verification status
    const verification = await Verification.findOne({
      where: { user_id: user.user_id }
    });

    // User payload for token generation
    const userPayload = { userId: user.user_id, username: user.username, role: user.user_type };

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    // Store the refresh token in a cookie
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict' });

    // Send response with access token, refresh token, user role, user ID, and verification status
    res.json({ 
      accessToken, 
      refreshToken, 
      role: user.user_type, 
      userId: user.user_id,
      verificationStatus: verification ? verification.status : false // Include verification status if found
    });
  } catch (error) {
    // Handle errors
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error });
  }
});




// Logout route with verifyRefreshToken middleware
router.post('/logout',  (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});


const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // Unauthorized if no token is found

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden if token is invalid
    req.user = user;
    next();
  });
};


// Status route
router.get('/status', verifyAccessToken, async (req, res) => {
  try {
    // Find the user by user ID from the token
    const user = await User.findOne({ where: { user_id: req.user.userId } });

    // If user doesn't exist, return not found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch verification status
    const verification = await Verification.findOne({
      where: { user_id: user.user_id }
    });

    // Send response with user's authentication status and details
    res.json({ 
      isAuthenticated: true, 
      role: user.user_type, 
      userId: user.user_id,
      verificationStatus: verification ? verification.status : false // Include verification status if found
    });
  } catch (error) {
    // Handle errors
    console.error('Error checking status:', error);
    res.status(500).json({ message: 'Error checking status', error });
  }
});













module.exports = router;
