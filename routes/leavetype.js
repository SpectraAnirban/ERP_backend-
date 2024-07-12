const express = require('express');
const router = express.Router();
const Leaves = require('../models/Leav'); // Correct path to Leav model
const User = require('../models/User');  // Correct path to User model

// Middleware to authenticate user and attach user info to req.user
const authenticateUser = (req, res, next) => {
  // Example: Mock user authentication
  // Replace with your actual authentication logic
  req.user = {
    user_id: 19, // Example user_id
    role: 'provision' // Example role
  };
  next();
};

router.use(authenticateUser);

// GET /leaves/get route
router.get('/get', async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Fetch user from database to get their role
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let leaves;
    if (user.role === 'provision') {
      // If user is provision, fetch only unpaid leaves
      leaves = await Leaves.findAll({
        where: {
          name: 'Unpaid Leave' // Adjust based on your actual field name and value
        }
      });
    } else {
      // For other roles, fetch all leaves
      leaves = await Leaves.findAll();
    }

    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/update/:leaveType', async (req, res) => {
    try {
      const { leaveType } = req.params;
      const { remainingLeaves } = req.body;
  
      // Find the leave type and update its remaining leaves
      const leave = await Leaves.findOne({ where: { name: leaveType } });
      
      if (!leave) {
        return res.status(404).json({ message: 'Leave type not found' });
      }
  
      leave.remainingLeaves = remainingLeaves;
      await leave.save();
  
      res.json({ message: 'Remaining leaves updated successfully' });
    } catch (error) {
      console.error('Error updating remaining leaves:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
module.exports = router;
