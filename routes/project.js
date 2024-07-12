const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Project = require('../models/Project');
const ProjectLead = require('../models/ProjectLead');
const Projectmember = require('../models/projmember');
const ProjectFiles = require('../models/ProjectFiles');
const User = require('../models/User');
const multer = require('multer');
const upload = multer(); // Memory storage
router.use(express.json());

router.post('/addProject', async (req, res) => {
  const { project_name, client, start_date, end_date, priority, lead_id, member_ids, description, project_files } = req.body;

  try {
    // Create the Project
    const project = await Project.create({
      project_name,
      client,
      start_date,
      end_date,
      priority,
      description,
      project_files // Add project_files field
    });

    // Assign the Project Lead
    await ProjectLead.create({
      user_id: lead_id,
      project_id: project.project_id
    });

    // Ensure member_ids is an array and not undefined
    if (Array.isArray(member_ids)) {
      // Assign Project Members
      for (const member of member_ids) {
        try {
          await Projectmember.create({
            user_id: member,
            project_id: project.project_id
          });
        } catch (memberError) {
          console.error(`Error adding member ${member} to project ${project.project_id}: ${memberError.message}`);
        }
      }
    } else {
      console.warn('member_ids is not an array or is undefined');
    }

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error(`Error creating project: ${error.message}`);
    res.status(500).json({
      message: 'Error creating project',
      error: error.message
    });
  }
});

// get all projects associated with the logged-in user
router.get('/projects', async (req, res) => {
  const { userId } = req.query;

  try {
    // Fetch project IDs where the user is a lead
    const leadProjects = await ProjectLead.findAll({
      where: { user_id: userId },
      attributes: ['project_id']
    });

    // Fetch project IDs where the user is a member
    const memberProjects = await Projectmember.findAll({
      where: { user_id: userId },
      attributes: ['project_id']
    });

    // Combine and deduplicate project IDs
    const projectIds = [
      ...new Set([
        ...leadProjects.map(project => project.project_id),
        ...memberProjects.map(project => project.project_id)
      ])
    ];

    if (projectIds.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch projects based on unique project IDs
    const projects = await Project.findAll({
      where: { project_id: { [Op.in]: projectIds } },
      order: [['project_id', 'DESC']] // Order projects by project_id in descending order
    });

    // Fetch and integrate project lead and member details for each project
    const projectsWithDetails = await Promise.all(projects.map(async (project) => {
      // Fetch project lead user IDs
      const leadIds = (await ProjectLead.findAll({
        where: { project_id: project.project_id },
        attributes: ['user_id']
      })).map(lead => lead.user_id);

      // Fetch project member user IDs
      const memberIds = (await Projectmember.findAll({
        where: { project_id: project.project_id },
        attributes: ['user_id']
      })).map(member => member.user_id);

      // Fetch user details based on lead and member IDs
      const leadUsers = await User.findAll({
        where: { user_id: leadIds },
        attributes: ['user_id', 'name']
      });

      const memberUsers = await User.findAll({
        where: { user_id: memberIds },
        attributes: ['user_id', 'name']
      });

      return {
        ...project.toJSON(),
        lead: leadUsers,
        members: memberUsers
      };
    }));

    res.status(200).json(projectsWithDetails);
  } catch (error) {
    console.error(`Error fetching projects: ${error.message}`);
    res.status(500).json({
      message: 'Error fetching projects',
      error: error.message
    });
  }
});




router.get('/projectdetails/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    // Fetch the project by project ID
    const project = await Project.findOne({
      where: { project_id: projectId }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Fetch project lead user IDs
    const leadIds = (await ProjectLead.findAll({
      where: { project_id: project.project_id },
      attributes: ['user_id']
    })).map(lead => lead.user_id);

    // Fetch project member user IDs
    const memberIds = (await Projectmember.findAll({
      where: { project_id: project.project_id },
      attributes: ['user_id']
    })).map(member => member.user_id);

    // Fetch user details based on lead and member IDs
    const leadUsers = await User.findAll({
      where: { user_id: { [Op.in]: leadIds } },
      attributes: ['user_id', 'name']
    });

    const memberUsers = await User.findAll({
      where: { user_id: { [Op.in]: memberIds } },
      attributes: ['user_id', 'name']
    });

    const projectWithDetails = {
      ...project.toJSON(),
      lead: leadUsers,
      members: memberUsers
    };

    res.status(200).json(projectWithDetails);
  } catch (error) {
    console.error(`Error fetching project: ${error.message}`);
    res.status(500).json({
      message: 'Error fetching project',
      error: error.message
    });
  }
});



// fetch all projects Api for ADMIN and HR
router.get('/allprojects', async (req, res) => {
  try {
    // Fetch all projects ordered by end_date in descending order
    const projects = await Project.findAll({
      order: [['project_id', 'DESC']]
    });

    // Fetch and integrate project lead and member details for each project
    const projectsWithDetails = await Promise.all(projects.map(async (project) => {
      // Fetch project lead user IDs
      const leadIds = (await ProjectLead.findAll({
        where: { project_id: project.project_id },
        attributes: ['user_id']
      })).map(lead => lead.user_id);

      // Fetch project member user IDs
      const memberIds = (await Projectmember.findAll({
        where: { project_id: project.project_id },
        attributes: ['user_id']
      })).map(member => member.user_id);

      // Fetch user details based on lead and member IDs
      const leadUsers = await User.findAll({
        where: { user_id: leadIds },
        attributes: ['user_id', 'name']
      });

      const memberUsers = await User.findAll({
        where: { user_id: memberIds },
        attributes: ['user_id', 'name']
      });

      return {
        ...project.toJSON(),
        lead: leadUsers,
        members: memberUsers
      };
    }));

    res.status(200).json(projectsWithDetails);
  } catch (error) {
    console.error(`Error fetching projects: ${error.message}`);
    res.status(500).json({
      message: 'Error fetching projects',
      error: error.message
    });
  }
});



// Update or edit project
router.put('/updateProject/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { project_name, client, start_date, end_date, priority, lead_id, member_ids, description, project_files } = req.body;

  try {
    // Find the project by ID
    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Validate the lead_id
    const leadUser = await User.findByPk(lead_id);
    if (!leadUser) {
      return res.status(400).json({ message: `Lead user with ID ${lead_id} does not exist` });
    }

    // Validate member_ids
    if (Array.isArray(member_ids)) {
      for (const member of member_ids) {
        const memberUser = await User.findByPk(member);
        if (!memberUser) {
          return res.status(400).json({ message: `Member user with ID ${member} does not exist` });
        }
      }
    } else {
      return res.status(400).json({ message: 'member_ids is not an array or is undefined' });
    }

    // Update the Project details
    await project.update({
      project_name,
      client,
      start_date,
      end_date,
      priority,
      description,
      project_files
    });

    // Update the Project Lead
    const projectLead = await ProjectLead.findOne({ where: { project_id: projectId } });
    if (projectLead) {
      await projectLead.update({ user_id: lead_id });
      console.log(`Updated project lead to user ID: ${lead_id}`);
    } else {
      await ProjectLead.create({
        user_id: lead_id,
        project_id: projectId
      });
      console.log(`Created new project lead with user ID: ${lead_id}`);
    }

    // First, remove all existing members for this project
    await Projectmember.destroy({ where: { project_id: projectId } });
    console.log(`Removed existing members for project ID: ${projectId}`);

    // Assign new Project Members
    for (const member of member_ids) {
      try {
        await Projectmember.create({
          user_id: member,
          project_id: projectId
        });
        console.log(`Added member ${member} to project ${projectId}`);
      } catch (memberError) {
        console.error(`Error adding member ${member} to project ${projectId}: ${memberError.message}`);
      }
    }

    res.status(200).json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error(`Error updating project: ${error.message}`);
    res.status(500).json({
      message: 'Error updating project',
      error: error.message
    });
  }
});





module.exports = router;
