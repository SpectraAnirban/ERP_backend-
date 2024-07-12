const express = require('express');
const Role = require('../models/Role');
require('dotenv').config();
const router = express.Router();

//get all roles
router.get('/roles', async (req, res) => {
    try {
      // Fetch all roles from the database
      const roles = await Role.findAll();
  
      // Send the roles as JSON response
      res.json(roles);
    } catch (err) {
      // If there's an error, send a 500 Internal Server Error response
      console.error('Error fetching roles:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  module.exports = router;