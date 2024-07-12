const express = require('express');
const User = require('../models/User');
const Role = require('../models/Role');
const UserDetails = require('../models/UserDetails'); // Adjust the path as necessary
require('dotenv').config();
const router = express.Router();
const sequelize = require('../config/database');
const { Op } = require('sequelize');


// Route to get all users based on office_id (example)
router.get('/alluser', async (req, res) => {
  try {
      const { office_id } = req.query;

      if (!office_id) {
          return res.status(400).json({ error: 'office_id parameter is required' });
      }

      const users = await User.findAll({
          where: {
              office_id: office_id,
              user_type: 'Employee' // Filter users by user_type being 'Employee'
          },
      });

      res.json(users);
  } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

  
  // Route to filter users based on employee_id, employee_name, designation
  router.get('/filterusers', async (req, res) => {
    try {
      const { employee_id, designation } = req.query;
  
      const filter = {};
  
      if (employee_id) {
        filter.employee_id = employee_id;
      }

      if (designation) {
        filter.designation = designation;
      }
  
      const users = await User.findAll({
        where: filter,
      });
  
      res.json(users);
    } catch (err) {
      console.error('Error filtering users:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  


// User details and profile apis

// Add UserDetails API
router.post('/addUserDetails', async (req, res) => {
  const {
    user_id, employee_id, name, address, city, pincode, state, country, phone, email_address,
    official_email_address, gender, date_of_birth, forte, other_skills, pan_card_no, passport_no,
    aadhar_no, nationality, religion, marital_status, employment_of_spouse, no_of_children
  } = req.body;

  try {
    const newUserDetails = await UserDetails.create({
      user_id, employee_id, name, address, city, pincode, state, country, phone, email_address,
      official_email_address, gender, date_of_birth, forte, other_skills, pan_card_no, passport_no,
      aadhar_no, nationality, religion, marital_status, employment_of_spouse, no_of_children
    });
    res.status(201).json(newUserDetails);
  } catch (error) {
    console.error(`Error adding user details: ${error.message}`);
    res.status(500).json({ message: 'Error adding user details', error: error.message });
  }
});




// Update UserDetails API
router.put('/updateUserDetails/:id', async (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;

  try {
    // Find the existing user details record by ID
    const userDetails = await UserDetails.findByPk(id);

    if (!userDetails) {
      return res.status(404).json({ message: 'User details not found' });
    }

    // Update only the fields that are provided in the request body
    Object.keys(updatedFields).forEach(key => {
      if (updatedFields[key] !== undefined) {
        userDetails[key] = updatedFields[key];
      }
    });

    // Save the updated user details record
    await userDetails.save();
    res.status(200).json(userDetails);
  } catch (error) {
    console.error(`Error updating user details: ${error.message}`);
    res.status(500).json({ message: 'Error updating user details', error: error.message });
  }
});







// Fetch UserDetails by user_id API
router.get('/getUserDetails', async (req, res) => {
  const { userId } = req.query;

  try {
    const userDetails = await UserDetails.findOne({
      where: { user_id: userId }
    });

    if (!userDetails) {
      return res.status(404).json({ message: 'User details not found' });
    }

    res.status(200).json(userDetails);
  } catch (error) {
    console.error(`Error fetching user details: ${error.message}`);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
});



// Fetch all UserDetails API
router.get('/getAllUserDetails', async (req, res) => {
  try {
    // Fetch all user details for users with employee types
    const userDetails = await sequelize.query(
      `SELECT ud.*, u.role_id
       FROM User_Details ud
       JOIN Users u ON ud.user_id = u.user_id
       WHERE u.user_type != 'Client'`, // Filter out users with user_type = 'Client'
      { type: sequelize.QueryTypes.SELECT }
    );

    if (!userDetails || userDetails.length === 0) {
      return res.status(404).json({ message: 'No user details found' });
    }

    // Fetch all roles
    const roles = await sequelize.query(
      `SELECT role_id, name AS role_name
       FROM Roles`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // Create a map of role_id to role_name
    const roleMap = roles.reduce((map, role) => {
      map[role.role_id] = role.role_name;
      return map;
    }, {});

    // Enrich userDetails with role names
    const enrichedUserDetails = userDetails.map(userDetail => ({
      ...userDetail,
      role_name: roleMap[userDetail.role_id] || 'NA'
    }));

    res.status(200).json(enrichedUserDetails);
  } catch (error) {
    console.error(`Error fetching user details: ${error.message}`);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
});




// Search users endpoint
router.get('/search', async (req, res) => {
  const { employee_name} = req.query;

  console.log('Query parameters:', { employee_name });

  try {
    let searchCriteria = {
      user_type: 'Employee'
    };

    if (employee_name) {
      searchCriteria.name = {
        [Op.like]: `%${employee_name}%`
      };
    }



    console.log('Search criteria:', searchCriteria);

    const users = await User.findAll({ where: searchCriteria });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// change status
router.put('/update-status/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { is_active } = req.body;

  try {
    // Find the user by ID
    const user = await User.findByPk(user_id);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the is_active status
    user.is_active = is_active;

    // Save the updated user record
    await user.save();

    res.status(200).json({ message: 'User status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
});



// PUT route to update user details
router.put('/updatebasic/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const {
    name, phone, birthday, address, city, state, pincode, country, gender, forte, other_skills, email
  } = req.body;

  try {
    // Find the user details by user_id
    const userDetails = await UserDetails.findOne({ where: { user_id } });
    const user = await User.findOne({ where: { user_id } });

    if (!userDetails || !user) {
      return res.status(404).json({ error: 'User details not found' });
    }

    // Update only the provided fields in UserDetails
    if (name !== undefined) userDetails.name = name;
    if (phone !== undefined) userDetails.phone = phone;
    if (birthday !== undefined) userDetails.date_of_birth = birthday;
    if (address !== undefined) userDetails.address = address;
    if (city !== undefined) userDetails.city = city;
    if (state !== undefined) userDetails.state = state;
    if (pincode !== undefined) userDetails.pincode = pincode;
    if (country !== undefined) userDetails.country = country;
    if (gender !== undefined) userDetails.gender = gender;
    if (forte !== undefined) userDetails.forte = forte;
    if (other_skills !== undefined) userDetails.other_skills = other_skills;
    if (email !== undefined) userDetails.email_address = email;

    await userDetails.save();

    // Update the name field in User
    if (name !== undefined) {
      user.name = name;
      await user.save();
    }

    res.status(200).json({ message: 'User details updated successfully', userDetails });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ error: 'Failed to update user details' });
  }
});





  module.exports = router;