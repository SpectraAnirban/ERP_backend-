const express = require('express');
const router = express.Router();
const Holiday = require('../models/Holiday');
const UserDetails = require('../models/UserDetails');

// Get all active holidays and user birthdays (date of birth)
router.get('/get', async (req, res) => {
  try {
    // Fetch active holidays
    const activeHolidays = await Holiday.findAll({
      where: {
        status: 'Active'
      }
    });

    // Fetch user birthdays (date of birth)
    const userBirthdays = await UserDetails.findAll({
      attributes: ['name','user_id', 'date_of_birth']
    });

    // Combine data into a single response object
    const responseData = {
      activeHolidays: activeHolidays,
      userBirthdays: userBirthdays
    };

    // Send combined data as JSON response
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
