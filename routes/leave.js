//priyabrata
// routes/leave.js
const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const Leave = require('../models/Leav');
const LeaveRequest = require('../models/Dleav');
const User = require('../models/User');
const { Op } = require('sequelize');
router.use(express.json());

router.get('/get', async (req, res) => {
  try {
    // Fetch all leave types from the database
    const leaves = await Leave.findAll();

    // Respond with success and leave data
    res.status(200).json({
      message: 'Leave types fetched successfully',
      leaves
    });
  } catch (error) {
    console.error(`Error fetching leave types: ${error.message}`);
    res.status(500).json({
      message: 'Error fetching leave types',
      error: error.message
    });
  }
});

async function storeMonthlyLeaveData(user_id, leave_id) {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // months are zero-indexed in JavaScript

    // Calculate total approved leave days for the current month
    const totalApprovedLeavesThisMonth = await LeaveRequest.sum('total_days', {
      where: {
        user_id,
        leave_id,
        status: 'approved',
        dates: {
          [Op.like]: `%${currentYear}-${currentMonth.toString().padStart(2, '0')}%` // Check if any leave request exists in the current month
        }
      }
    });

    // Return total approved leave days for the current month
    return totalApprovedLeavesThisMonth || 0; // Return 0 if no leaves approved this month
  } catch (error) {
    console.error(`Error storing monthly leave data: ${error.message}`);
    return 0; // Return default value in case of error
  }
}
router.get('/leaves/leave-req/remaining/:userId/:leaveType', (req, res) => {
  const { userId, leaveType } = req.params;

  // Simulating fetching data from a database or elsewhere
  const remainingLeaves = remainingLeavesData[userId][leaveType];

  if (remainingLeaves === undefined) {
      return res.status(404).json({ error: 'Leave type not found or user ID not found' });
  }

  res.json({ remaining_days: remainingLeaves });
});
router.get('/leave-req/remaining/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    // Get all leave types
    const leaveTypes = await Leave.findAll();

    // Initialize an array to hold the remaining, taken, and monthly collected leave days for each type
    const leaveData = [];

    // Get current month
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Months are zero-indexed in JavaScript

    // Iterate over each leave type and calculate remaining, taken, and monthly collected days
    for (const leaveType of leaveTypes) {
      const leave_id = leaveType.id_leave;
      const leave_name = leaveType.name;
      const max_days = leaveType.max_days;

      // Calculate the user's total approved leave days for the leave type
      const totalApprovedLeaves = await LeaveRequest.sum('total_days', {
        where: {
          user_id,
          leave_id,
          status: 'approved' // Assuming you have a status field that tracks approval
        }
      });

      // Calculate the remaining leave days
      const remainingLeaveDays = leaveType.max_days - (totalApprovedLeaves || 0);

      // Calculate the total taken leave days for the leave type
      const totalTakenLeaves = totalApprovedLeaves || 0;

      let monthlyCollectedDays = 0;

      // Calculate monthly collected leave days only for "Casual Leave"
      if (leave_name === "Casual Leave") {
        // Assume a total of 12 casual leave days per year, accumulating monthly
        const totalAnnualCasualLeaves = leaveType.max_days;
        const monthlyAccumulationRate = totalAnnualCasualLeaves / 12;

        // Calculate accumulated leaves up to the current month
        const accumulatedLeavesUntilNow = Math.floor(monthlyAccumulationRate * currentMonth);

        // Calculate remaining leaves for this month
        monthlyCollectedDays = accumulatedLeavesUntilNow - totalTakenLeaves;

        // Ensure monthly collected days do not go below zero
        monthlyCollectedDays = Math.max(monthlyCollectedDays, 0);

        // Ensure monthly collected days do not exceed the total remaining leaves
        monthlyCollectedDays = Math.min(monthlyCollectedDays, remainingLeaveDays);
      }

      // Push leave data with remaining, taken, and monthly collected days to the result array
      leaveData.push({
        leave_name,
        remaining_days: remainingLeaveDays,
        taken_days: totalTakenLeaves,
        monthly_collected_days: monthlyCollectedDays,
        max_days
      });
    }

    // Respond with the leave data including remaining, taken, and monthly collected days
    res.status(200).json({
      message: 'Remaining, taken, and monthly collected leave days retrieved successfully',
      leaveData
    });
  } catch (error) {
    console.error(`Error retrieving remaining and taken leave days: ${error.message}`);
    res.status(500).json({
      message: 'Error retrieving remaining and taken leave days',
      error: error.message
    });
  }
});

// Function to determine allowed monthly leaves based on current month
function determineMonthlyLeaves(currentMonth) {
  switch (currentMonth) {
    case 1: // January
    case 3: // March
    case 5: // May
    case 7: // July
    case 8: // August
    case 10: // October
    case 12: // December
      return 8; // 8 leaves allowed for months with 31 days
    case 4: // April
    case 6: // June
    case 9: // September
    case 11: // November
      return 6; // 6 leaves allowed for months with 30 days
    case 2: // February
      return 4; // 4 leaves allowed for February (assuming it's not a leap year)
    default:
      return 0; // Default to 0 if no specific logic defined
  }
}
router.post('/leave-req/add', async (req, res) => {
  const {
    user_id,
    leave_id,
    leave_name,
    reason,
    dates,
    duration,
    total_days,
    status,
    comment
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    // 1. Find the leave type
    const leaveType = await Leave.findByPk(leave_id, { transaction });
    if (!leaveType) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Leave type not found' });
    }

    // 2. Calculate the user's total approved leave days for the requested leave type
    const totalApprovedLeaves = await LeaveRequest.sum('total_days', {
      where: {
        user_id,
        leave_id,
        status: 'approved' // Only consider approved leave requests for deduction
      },
      transaction
    });

    // 3. Calculate the remaining leave days
    let remainingLeaveDays = leaveType.max_days - (totalApprovedLeaves || 0);

    // 4. Check if it's a new year and reset remaining leave days if needed
    const today = new Date();
    const currentYear = today.getFullYear();

    // Find the most recent leave request for the current year
    const lastLeaveRequest = await LeaveRequest.findOne({
      where: {
        user_id,
        leave_id,
        dates: {
          [Op.like]: `%${currentYear}%` // Check if any leave request exists in the current year
        }
      },
      order: [['id_leave_request', 'DESC']],
      transaction
    });

    if (!lastLeaveRequest || !lastLeaveRequest.dates.includes(currentYear)) {
      // If no previous leave request found for the current year, reset remaining leave days
      remainingLeaveDays = leaveType.max_days;
    }

    // 5. Check if the user has enough leave days for the requested leave type
    if (remainingLeaveDays < total_days) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Insufficient leave days available. Please check your remaining balance.' });
    }

    // 6. Check leave-specific rules
    if (leave_name === 'Casual Leave') {
      // Casual leave rules
      const currentMonth = today.getMonth() + 1; // months are zero-indexed in JavaScript
      const currentMonthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

      const totalApprovedCasualLeavesThisMonth = await LeaveRequest.sum('total_days', {
        where: {
          user_id,
          leave_id,
          leave_name: 'Casual Leave',
          status: 'approved',
          dates: {
            [Op.like]: `%${currentMonthYear}%` // Check if any leave request exists in the current month
          }
        },
        transaction
      });

      // Determine allowed monthly leaves based on current month
      const allowedMonthlyLeaves = determineMonthlyLeaves(currentMonth);

      // Calculate monthly collected leave days by deducting taken leaves from allowed monthly leaves
      const monthlyCollectedDays = allowedMonthlyLeaves - totalApprovedCasualLeavesThisMonth;

      // Ensure monthly collected days are not less than 0
      if (monthlyCollectedDays <= 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'You have exhausted your casual leaves for this month.' });
      }

      // Check if the requested total_days exceed available monthly collected days
      if (total_days > monthlyCollectedDays) {
        await transaction.rollback();
        return res.status(400).json({ message: `You can only apply for up to ${monthlyCollectedDays} casual leaves for this month.` });
      }

      // Automatically approve if the duration is 3 days or fewer
      const startDate = new Date(dates[0]);
      const endDate = new Date(dates[dates.length - 1]);
      const daysDifference = Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000)) + 1;

      if (daysDifference <= 3) {
        status = 'approved';
      }
    } else {
      // For other leave types, apply regular approval logic
      // You can add specific rules for other leave types here if needed
    }

    // 7. Create a new leave request record in the database
    const leaveRequest = await LeaveRequest.create({
      user_id,
      leave_id,
      leave_name,
      reason,
      dates,
      duration,
      total_days,
      status,
      comment
    }, { transaction });

    // 8. Deduct approved leave days from remaining leave balance upon approval
    if (status === 'approved') {
      remainingLeaveDays -= total_days;
    }

    // 9. Commit the transaction
    await transaction.commit();

    // Respond with success message and leave request details
    res.status(201).json({
      message: 'Leave request added successfully',
      leaveRequest,
      remaining_balance: remainingLeaveDays
    });
  } catch (error) {
    // Rollback the transaction and handle errors
    await transaction.rollback();
    console.error(`Error adding leave request: ${error.message}`);
    res.status(500).json({
      message: 'Error adding leave request',
      error: error.message
    });
  }
});
// GET /api/leave-req/get/:user_id
router.get('/leave-req/get/', async (req, res) => {
  try {
    // Fetch leave requests for the specified user from the database in descending order of current_date
    const leaveRequests = await LeaveRequest.findAll({
      include: [
          { model: User, as: 'requester', attributes: ['username'] },
          { model: User, as: 'approver', attributes: ['username'] }
      ],
      order: [['current_date', 'DESC']]
  });
    res.json(leaveRequests);
  } catch (error) {
    console.error(`Error fetching leave requests: ${error.message}`);
    res.status(500).json({
      message: 'Error fetching leave requests',
      error: error.message
    });
  }
});
router.get('/leave-req/get/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    // Fetch leave requests for the specified user from the database
    const leaveRequests = await LeaveRequest.findAll({
      where: { user_id }
    });

    // Calculate remaining leave balance
    const totalApprovedLeaves = await LeaveRequest.sum('total_days', {
      where: {
        user_id,
        status: 'approved'
      }
    });

    const user = await User.findByPk(user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const leaveBalance = user.total_leave_days - (totalApprovedLeaves || 0);

    res.json({
      leaveRequests,
      leaveBalance
    });
  } catch (error) {
    console.error(`Error fetching leave requests: ${error.message}`);
    res.status(500).json({
      message: 'Error fetching leave requests',
      error: error.message
    });
  }
});
router.put('/leave-req/:id', async (req, res) => {
  const { id } = req.params; // Extract ID from URL parameter
  const updatedData = req.body; // Extract updated data from request body

  try {
    // Check if updatedData exists and is not empty
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ error: 'No data provided for update' });
    }

    // Find leave request by ID
    const leaveRequest = await LeaveRequest.findByPk(id);

    // Handle case where leave request is not found
    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Update the leave request including current_date
    await leaveRequest.update({
      ...updatedData,
      current_date: sequelize.literal('CURRENT_TIMESTAMP') // Update current_date to current timestamp
    });

    // Fetch updated leave request after update
    const updatedLeaveRequest = await LeaveRequest.findByPk(id);

    // Return updated leave request
    res.json(updatedLeaveRequest);
  } catch (error) {
    // Handle server errors
    console.error('Error updating leave request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;
