const express = require('express');
const Department = require('../models/Department');
require('dotenv').config();
const router = express.Router();

//get all department
router.get('/Department', async (req, res) => {
    try {
      // Fetch all department from the database
      const Departments = await Department.findAll();
  
      // Send the department as JSON response
      res.json(Departments);
    } catch (err) {
      // If there's an error, send a 500 Internal Server Error response
      console.error('Error fetching department:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  module.exports = router;