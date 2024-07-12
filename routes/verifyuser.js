// routes/verification.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize'); // Import Sequelize operators
const sequelize = require('../config/database');
const User = require('../models/User');
const Role = require('../models/Role'); // Adjust the path to your Role model
const Department = require('../models/Department'); // Adjust the path to your Department model
const UserDetails = require('../models/UserDetails'); // Adjust the path as necessary
const Verification = require('../models/Verification'); // Adjust the path as necessary
const generateUniqueEmployeeId = () => {
    return 'GRA' + Math.floor(100000 + Math.random() * 900000);
};

const isEmployeeIdUnique = async (employeeId) => {
    if (!employeeId) {
        return false; // Disregard empty or null employee IDs
    }
    try {
        const employee = await User.findOne({
            where: {
                employee_id: employeeId
            }
        });
        return !employee; // Returns true if no employee with the ID is found, meaning the ID is unique
    } catch (error) {
        console.error('Error checking employee ID uniqueness:', error);
        throw new Error('Error checking employee ID uniqueness');
    }
};

const generateAndCheckUniqueEmployeeId = async () => {
    let unique = false;
    let uniqueId;
    while (!unique) {
        uniqueId = generateUniqueEmployeeId();
        unique = await isEmployeeIdUnique(uniqueId);
    }
    return uniqueId;
};

router.get('/unique-employee-id', async (req, res) => {
    try {
        const uniqueId = await generateAndCheckUniqueEmployeeId();
        res.status(200).json({ employeeId: uniqueId });
    } catch (error) {
        console.error('Error generating unique employee ID:', error);
        res.status(500).json({ error: 'Failed to generate unique employee ID' });
    }
});


// API endpoint to fetch employees without verification or with verification status false
router.get('/unverified-employees', async (req, res) => {
    try {
      const [results] = await sequelize.query(`
        SELECT u.*, v.status AS verification_status
        FROM Users u
        LEFT JOIN Verification v ON u.user_id = v.user_id
        WHERE u.user_type = 'Employee' AND (v.status IS NULL OR v.status = false)
      `);
  
      res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching unverified employees:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// API endpoint to fetch employees without verification or with verification status false
router.get('/unverified-client', async (req, res) => {
    try {
      const [results] = await sequelize.query(`
        SELECT u.*, v.status AS verification_status
        FROM Users u
        LEFT JOIN Verification v ON u.user_id = v.user_id
        WHERE u.user_type = 'Client' AND (v.status IS NULL OR v.status = false)
      `);
  
      res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching unverified employees:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



// get user names for reporting api
router.get('/user-names', async (req, res) => {
    const { userId } = req.query;
    
    try {
        // Fetch the user based on the provided userId
        const requestingUser = await User.findOne({ where: { user_id: userId } });

        if (!requestingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        let users;
        if (requestingUser.user_type === 'Admin') {
            // Fetch all users excluding clients
            users = await User.findAll({ 
                where: { 
                    user_type: { 
                        [Op.not]: 'Client' 
                    } 
                }, 
                attributes: ['user_id', 'name']
            });
        } else if (requestingUser.user_type === 'HR') {
            // Fetch all users excluding clients and admins
            users = await User.findAll({ 
                where: { 
                    user_type: { 
                        [Op.notIn]: ['Client', 'Admin'] 
                    } 
                }, 
                attributes: ['user_id', 'name']
            });
        } else {
            return res.status(403).json({ error: 'Unauthorized user type' });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching user names:', error);
        res.status(500).json({ error: 'Failed to fetch user names' });
    }
});


// fetch roles user based
router.get('/roles', async (req, res) => {
    const { userId } = req.query;

    try {
        // Fetch the user based on the provided userId
        const requestingUser = await User.findOne({ where: { user_id: userId } });

        if (!requestingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        let roles;
        if (requestingUser.user_type === 'Admin') {
            // Fetch all roles with status true
            roles = await Role.findAll({ 
                where: { 
                    status: true 
                },
                attributes: ['role_id', 'name']
            });
        } else if (requestingUser.user_type === 'HR') {
            // Fetch all roles excluding Admin and HR with status true
            roles = await Role.findAll({ 
                where: { 
                    name: { 
                        [Op.notIn]: ['Admin', 'HR'] 
                    },
                    status: true
                },
                attributes: ['role_id', 'name']
            });
        } else {
            return res.status(403).json({ error: 'Unauthorized user type' });
        }

        res.status(200).json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});



// Fetch all department 
router.get('/departments', async (req, res) => {
    try {
        // Fetch all departments
        const departments = await Department.findAll({
            attributes: ['id_department', 'name']
        });

        res.status(200).json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});





// Update user details and verification status
router.post('/update-user', async (req, res) => {
    const {
        userId, 
        reportedTo, 
        joiningDate, 
        department, 
        designation, 
        roleId, 
        employeeId 
    } = req.body;
    const verifierId = req.query.verifierId; // Assume the verifier's ID is passed as a query parameter

    try {
        // Fetch the user based on the provided userId
        const user = await User.findOne({ where: { user_id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch the role based on the provided roleId
        const role = await Role.findOne({ where: { role_id: roleId } });

        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }

        // Update the user table
        user.reported_to = reportedTo;
        user.joining_date = new Date(joiningDate);
        user.department = department;
        user.designation = designation;
        user.role_id = roleId;
        
        // Set user_type based on role name
        if (role.name === 'HR') {
            user.user_type = 'HR';
        } else if (role.name === 'Admin') {
            user.user_type = 'Admin';
        }

        await user.save();

        // Update the verification table
        const verification = await Verification.findOne({ where: { user_id: userId } });
        if (verification) {
            verification.status = true;
            verification.verifier_id = verifierId;
            verification.verified_at = new Date();
            await verification.save();
        } else {
            await Verification.create({
                user_id: userId,
                status: true,
                verifier_id: verifierId,
                verified_at: new Date()
            });
        }

        // Update the user details table
        let userDetails = await UserDetails.findOne({ where: { user_id: userId } });
        if (userDetails) {
            userDetails.employee_id = employeeId;
            await userDetails.save();
        } else {
            await UserDetails.create({
                user_id: userId,
                employee_id: employeeId
            });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});










module.exports = router;
