const express = require('express');
const Attendance  = require('../models/Attendance');
const sequelize = require('../config/database');
require('dotenv').config();
const router = express.Router();
const moment = require('moment-timezone');

router.post('/add', async (req, res) => {
  try {
    const { date, start_time, user_id } = req.body;

    // Convert start_time to a moment object and set the timezone if necessary
    const startTime = moment(start_time, 'HH:mm').tz('your-timezone');

    // Define the time range
    const startRange = moment('09:00', 'HH:mm').tz('your-timezone');
    const endRange = moment('11:55', 'HH:mm').tz('your-timezone');

    // Check if start_time is within the allowed range
    if (startTime.isBetween(startRange, endRange, 'minute', '[]')) {
      // Insert new attendance record
      const attendance = await Attendance.create({
        date,
        start_time,
        user_id
      });

      res.status(201).json({ message: 'Attendance record added successfully', attendance });
    } else {
      res.status(400).json({ error: 'Start time must be between 9:00 AM and 11:55 AM' });
    }
  } catch (error) {
    console.error('Error adding attendance:', error);
    res.status(500).json({ error: 'Failed to add attendance record' });
  }
});


// PUT route to update attendance record
router.put('/update', async (req, res) => {
    const { userId, date } = req.query;
    const { end_time } = req.body; // Assuming end_time can be optional
  
    try {
      // Calculate total time difference only if end_time is provided
      let total_time = null;
      if (end_time) {
        const [result] = await sequelize.query(`
          SELECT 
            SEC_TO_TIME(SUM(TIME_TO_SEC(:end_time) - TIME_TO_SEC(start_time))) AS total_time
          FROM 
            Attendance
          WHERE 
            user_id = :userId
            AND date = :date
        `, {
          replacements: { userId, date, end_time },
          type: sequelize.QueryTypes.SELECT
        });
  
        total_time = result.total_time;
      }
  
      // Check if total_time is null or 8 hours or more (if calculated)
      if (!total_time || total_time >= '08:00:00') {
        // Prepare update object
        const updateObj = { end_time };
        if (total_time) {
          updateObj.total_time = total_time;
        }
  
        // Update attendance record with end_time and possibly total_time
        const [updatedCount] = await Attendance.update(updateObj, {
          where: { user_id: userId, date }
        });
  
        if (updatedCount > 0) {
          res.status(200).json({ message: 'Attendance record updated successfully' });
        } else {
          res.status(404).json({ error: 'Attendance record not found' });
        }
      } else {
        res.status(400).json({ error: 'Total time must be 8 hours or more' });
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      res.status(500).json({ error: 'Failed to update attendance record' });
    }
});


// Endpoint to check check-in state

router.get('/check-state', async (req, res) => {
    try {
        const userId = req.query.userId;
        const currentDate = new Date().toISOString().split('T')[0]; // Get the current date in YYYY-MM-DD format

        // Log the variables to check their values
        console.log(`Checking check-in state for user: ${userId} on date: ${currentDate}`);

        // Ensure the where clause is correctly used
        const attendance = await Attendance.findOne({
            where: {
                user_id: userId,
                date: currentDate
            }
        });

        if (attendance && attendance.start_time && !attendance.end_time) {
            // User has checked in but not checked out yet
            res.json({ isCheckedIn: true });
        } else {
            // User has not checked in yet or has already checked out
            res.json({ isCheckedIn: false });
        }
    } catch (error) {
        console.error('Error checking check-in state:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});










  module.exports = router;