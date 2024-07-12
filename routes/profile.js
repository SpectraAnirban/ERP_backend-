const express = require('express');
const User = require('../models/User');
const Role = require('../models/Role');
const UserDetails = require('../models/UserDetails'); // Adjust the path as necessary
const EmergencyContact = require('../models/EmergencyContact');
const EducationalInformation = require('../models/EducationalInformation');
const BankDetails = require('../models/BankDetails');
const Department = require('../models/Department');
require('dotenv').config();
const router = express.Router();


// GET route to fetch user details by user_id using query parameter
router.get('/personal', async (req, res) => {
    const userId = req.query.userId; // Get userId from query parameters
  
    try {
      // Fetch UserDetails
      const userDetails = await UserDetails.findOne({
        where: { user_id: userId }
      });
  
      if (!userDetails) {
        return res.status(404).json({ error: 'User details not found' });
      }
  
      // Fetch User details separately
      const user = await User.findOne({
        where: { user_id: userId },
        attributes: ['is_active', 'reported_to', 'employee_id', 'joining_date', 'phone_no', 'department', 'role_id'] // Assuming 'role_id' is the column for the role
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Fetch Department details
      const department = await Department.findOne({
        where: { id_department: user.department }
      });
  
      // Fetch Role details
      const role = await Role.findOne({
        where: { role_id: user.role_id }
      });
  
      // Combine UserDetails, User, Department, and Role data
      const combinedDetails = {
        userDetails: {
          details_id: userDetails.details_id,
          user_id: userDetails.user_id,
          employee_id: userDetails.employee_id,
          name: userDetails.name,
          address: userDetails.address,
          city: userDetails.city,
          pincode: userDetails.pincode,
          state: userDetails.state,
          country: userDetails.country,
          phone: userDetails.phone,
          email_address: userDetails.email_address,
          official_email_address: userDetails.official_email_address,
          gender: userDetails.gender,
          date_of_birth: userDetails.date_of_birth,
          forte: userDetails.forte,
          other_skills: userDetails.other_skills,
          pan_card_no: userDetails.pan_card_no,
          passport_no: userDetails.passport_no,
          aadhar_no: userDetails.aadhar_no,
          nationality: userDetails.nationality,
          religion: userDetails.religion,
          marital_status: userDetails.marital_status,
          employment_of_spouse: userDetails.employment_of_spouse,
          no_of_children: userDetails.no_of_children
        },
        user: {
          is_active: user.is_active,
          reported_to: user.reported_to,
          employee_id: user.employee_id,
          joining_date: user.joining_date,
          phone_no: user.phone_no,
          department: department ? department.name : null, // Assuming 'name' is the column for department name
          role: role ? role.name : null // Assuming 'name' is the column for role name
        }
      };
  
      res.status(200).json(combinedDetails);
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ error: 'Failed to fetch user details' });
    }
  });

  

// GET route to fetch emergency contacts by user_id query parameter
router.get('/emergency', async (req, res) => {
    const userId = req.query.userId;
  
    try {
      const emergencyContacts = await EmergencyContact.findAll({
        where: { user_id: userId }
      });
  
      if (!emergencyContacts || emergencyContacts.length === 0) {
        return res.status(404).json({ error: 'Emergency contacts not found' });
      }
  
      res.status(200).json({ emergencyContacts });
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      res.status(500).json({ error: 'Failed to fetch emergency contacts' });
    }
  });


// GET route to fetch educational information by user_id query parameter
router.get('/eduinfo', async (req, res) => {
    const userId = req.query.userId;
  
    try {
      const educationalInfo = await EducationalInformation.findAll({
        where: { user_id: userId }
      });
  
      if (!educationalInfo || educationalInfo.length === 0) {
        return res.status(404).json({ error: 'Educational information not found' });
      }
  
      res.status(200).json({ educationalInfo });
    } catch (error) {
      console.error('Error fetching educational information:', error);
      res.status(500).json({ error: 'Failed to fetch educational information' });
    }
  });


  // GET route to fetch bank details by user_id using query parameter
router.get('/bank-details', async (req, res) => {
    const userId = req.query.userId; // Get userId from query parameters
  
    try {
      const bankDetails = await BankDetails.findOne({
        where: { user_id: userId }
      });
  
      if (!bankDetails) {
        return res.status(404).json({ error: 'Bank details not found' });
      }
  
      res.status(200).json({ bankDetails });
    } catch (error) {
      console.error('Error fetching bank details:', error);
      res.status(500).json({ error: 'Failed to fetch bank details' });
    }
  });

// GET route to fetch username by user_id query parameter
router.get('/username', async (req, res) => {
    const userId = req.query.userId;
  
    try {
        const user = await User.findOne({
            where: { user_id: userId },
            attributes: ['username'] // Adjust the attribute name as per your schema
        });
    
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
    
        res.status(200).json({ username: user.username });
    } catch (error) {
        console.error('Error fetching username:', error);
        res.status(500).json({ error: 'Failed to fetch username' });
    }
});



// Fetch user details
router.get('/getuserdetails', async (req, res) => {
    const userId = req.query.userId;

    try {
        const user = await UserDetails.findOne({ where: { user_id: userId } });

        const userDetails = {
            pan_card_no: null,
            passport_no: null,
            aadhar_no: null,
            nationality: null,
            religion: null,
            marital_status: null,
            employment_of_spouse: null,
            no_of_children: null
        };

        if (user) {
            // Populate userDetails with actual values from the database
            Object.keys(userDetails).forEach(key => {
                if (user[key] !== undefined) {
                    userDetails[key] = user[key];
                }
            });
        }

        res.status(200).json(userDetails);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'An error occurred while fetching user details' });
    }
});









//personal details edit users
router.put('/userdetails/update', async (req, res) => {
    const userId = req.query.userId;
    const {
        pan_card_no,
        passport_no,
        aadhar_no,
        nationality,
        religion,
        marital_status,
        employment_of_spouse,
        no_of_children // Updated to match no_of_children in your model
    } = req.body;

    try {
        const user = await UserDetails.findOne({ where: { user_id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.update({
            pan_card_no,
            passport_no,
            aadhar_no,
            nationality,
            religion,
            marital_status,
            employment_of_spouse,
            no_of_children
        });

        res.status(200).json({ message: 'User details updated successfully' });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ error: 'An error occurred while updating user details' });
    }
});









// Fetch bank details
router.get('/getbankdetails', async (req, res) => {
    const userId = req.query.userId;

    try {
        const bankDetails = await BankDetails.findOne({ where: { user_id: userId } });

        const bankDetailsResponse = {
            bank_name: null,
            bank_account_no: null,
            ifsc_code: null,
            branch_name: null,
            accountHolder_name: null
        };

        if (bankDetails) {
            // Populate bankDetailsResponse with actual values from the database
            Object.keys(bankDetailsResponse).forEach(key => {
                if (bankDetails[key] !== undefined) {
                    bankDetailsResponse[key] = bankDetails[key];
                }
            });
        }

        res.status(200).json(bankDetailsResponse);
    } catch (error) {
        console.error('Error fetching bank details:', error);
        res.status(500).json({ error: 'An error occurred while fetching bank details' });
    }
});

// Update or create bank details
router.put('/bankdetails/update', async (req, res) => {
    const userId = req.query.userId;
    const {
        bank_name,
        bank_account_no,
        ifsc_code,
        branch_name,
        accountHolder_name
    } = req.body;

    try {
        let bankDetails = await BankDetails.findOne({ where: { user_id: userId } });

        if (!bankDetails) {
            // If bank details not found, create new record
            bankDetails = await BankDetails.create({
                user_id: userId,
                bank_name,
                bank_account_no,
                ifsc_code,
                branch_name,
                accountHolder_name
            });

            return res.status(201).json({ message: 'Bank details created successfully', bankDetails });
        }

        // If bank details found, update existing record
        await bankDetails.update({
            bank_name,
            bank_account_no,
            ifsc_code,
            branch_name,
            accountHolder_name
        });

        res.status(200).json({ message: 'Bank details updated successfully', bankDetails });
    } catch (error) {
        console.error('Error updating bank details:', error);
        res.status(500).json({ error: 'An error occurred while updating bank details' });
    }
});



// Fetch educational information
router.get('/geteducationalinfo', async (req, res) => {
    const userId = req.query.userId;

    try {
        const educationalInfo = await EducationalInformation.findOne({ where: { user_id: userId } });

        const educationalInfoResponse = {
            institute: null,
            year_of_passing: null,
            degree_name: null
        };

        if (educationalInfo) {
            // Populate educationalInfoResponse with actual values from the database
            Object.keys(educationalInfoResponse).forEach(key => {
                if (educationalInfo[key] !== undefined) {
                    educationalInfoResponse[key] = educationalInfo[key];
                }
            });
        }

        res.status(200).json(educationalInfoResponse);
    } catch (error) {
        console.error('Error fetching educational information:', error);
        res.status(500).json({ error: 'An error occurred while fetching educational information' });
    }
});


// Update or create educational information
router.put('/educationalinfo/update', async (req, res) => {
    const userId = req.query.userId; // Fetch userId from query parameters
    const educationalInfoArray = req.body.educationalInfo; // Assuming educationalInfo is an array of objects

    try {
        if (!userId) {
            return res.status(400).json({ error: 'userId parameter is required' });
        }

        let updatedEducationalInfo = [];

        for (let info of educationalInfoArray) {
            let educationalInfo = await EducationalInformation.findOne({ where: { user_id: userId, degree_name: info.degree_name } });

            if (!educationalInfo) {
                // If no educational info found, create a new record
                educationalInfo = await EducationalInformation.create({
                    user_id: userId,
                    institute: info.institute,
                    year_of_passing: info.year_of_passing,
                    degree_name: info.degree_name
                });
            } else {
                // If educational info found, update existing record
                await educationalInfo.update({
                    institute: info.institute,
                    year_of_passing: info.year_of_passing
                });
            }

            updatedEducationalInfo.push(educationalInfo);
        }

        res.status(200).json({ message: 'Educational information updated successfully', educationalInfo: updatedEducationalInfo });
    } catch (error) {
        console.error('Error updating educational information:', error);
        res.status(500).json({ error: 'An error occurred while updating educational information' });
    }
});


// Update or create emergency contacts
router.put('/emergencycontacts/update', async (req, res) => {
    const userId = req.query.userId; // Fetch userId from query parameters
    const emergencyContactsArray = req.body.emergencyContacts; // Assuming emergencyContacts is an array of objects

    try {
        if (!userId) {
            return res.status(400).json({ error: 'userId parameter is required' });
        }

        let updatedEmergencyContacts = [];

        for (let contact of emergencyContactsArray) {
            let emergencyContact = await EmergencyContact.findOne({ where: { user_id: userId, relationship: contact.relationship } });

            if (!emergencyContact) {
                // If no emergency contact found, create a new record
                emergencyContact = await EmergencyContact.create({
                    user_id: userId,
                    name: contact.name,
                    relationship: contact.relationship,
                    phone: contact.phone
                });
            } else {
                // If emergency contact found, update existing record
                await emergencyContact.update({
                    name: contact.name,
                    phone: contact.phone
                });
            }

            updatedEmergencyContacts.push(emergencyContact);
        }

        res.status(200).json({ message: 'Emergency contacts updated successfully', emergencyContacts: updatedEmergencyContacts });
    } catch (error) {
        console.error('Error updating emergency contacts:', error);
        res.status(500).json({ error: 'An error occurred while updating emergency contacts' });
    }
});







module.exports = router;