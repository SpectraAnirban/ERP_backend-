const express = require('express');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('../models/Project'); // Import Project model
const Task = require('../models/Task'); // Import Task model
const SubTask = require('../models/SubTask'); // Import SubTask model
const TaskUser = require('../models/TaskUser');
const User = require('../models/User');
const { Op } = require('sequelize');
require('dotenv').config();
const router = express.Router();

// Endpoint to add a new task and associate it with a user
router.post('/add-task', async (req, res) => {
    const { user_id, project_id, task_name, task_description, status, subTasks } = req.body;

    try {
      // Create a new task
      const task = await Task.create({
        project_id,
        task_name,
        task_description,
        status
      });

      // Create an array to store created subtasks
      const createdSubTasks = [];

      // Iterate through subTasks array and create each subtask
      for (const subTaskData of subTasks) {
        const subTask = await SubTask.create({
          project_id,
          task_id: task.task_id,
          subtask_description: subTaskData.subtask_description,
          status: subTaskData.status,
          deadline: subTaskData.deadline // Adjust as needed
        });
        createdSubTasks.push(subTask);
      }

      // Associate the task with the user in TaskUser table
      await TaskUser.create({
        user_id,
        task_id: task.task_id
      });

      res.status(201).json({ message: 'Task added successfully', task, subTasks: createdSubTasks });
    } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});


// fetch tasks based on user id
  router.get('/fetchtasks', async (req, res) => {
    const { user_id } = req.query;
  
    try {
        // Fetch task IDs associated with the user
        const taskUsers = await TaskUser.findAll({
          where: { user_id },
          attributes: ['task_id']
        });
    
        // Extract task IDs from the result
        const taskIds = taskUsers.map(taskUser => taskUser.task_id);
    
        if (taskIds.length === 0) {
          return res.status(200).json({ tasks: [] });
        }
    
        // Fetch tasks based on the extracted task IDs
        const tasks = await Task.findAll({
          where: { task_id: taskIds }
        });
    
        // Fetch subtasks for the obtained tasks
        const subTasks = await SubTask.findAll({
          where: { task_id: taskIds }
        });
    
        // Map subtasks to their respective tasks
        const tasksWithSubTasks = tasks.map(task => {
          const taskSubTasks = subTasks.filter(subTask => subTask.task_id === task.task_id);
          return { ...task.toJSON(), subTasks: taskSubTasks };
        });
    
        res.status(200).json({ tasks: tasksWithSubTasks });
      } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  



    // Update or edit tasks 
    router.put('/edit-task', async (req, res) => {
        const { task_id } = req.query;
        const { user_id, project_id, task_name, task_description, status, subTasks } = req.body;
      
        try {
          // Find the task to be updated
          const task = await Task.findByPk(task_id);
      
          if (!task) {
            return res.status(404).json({ error: 'Task not found' });
          }
      
          // Update the task details
          task.project_id = project_id;
          task.task_name = task_name;
          task.task_description = task_description;
          task.status = status;
      
          await task.save();
      
          // Delete existing subtasks for the task
          await SubTask.destroy({ where: { task_id } });
      
          // Create an array to store updated subtasks
          const updatedSubTasks = [];
      
          // Iterate through subTasks array and create each subtask
          for (const subTaskData of subTasks) {
            const subTask = await SubTask.create({
              project_id,
              task_id: task.task_id,
              subtask_description: subTaskData.subtask_description,
              status: subTaskData.status,
              deadline: subTaskData.deadline // Adjust as needed
            });
            updatedSubTasks.push(subTask);
          }
      
          // Update the task-user association if needed
          const taskUser = await TaskUser.findOne({ where: { task_id } });
          if (taskUser) {
            taskUser.user_id = user_id;
            await taskUser.save();
          } else {
            // If no association exists, create a new one
            await TaskUser.create({
              user_id,
              task_id: task.task_id
            });
          }
      
          res.status(200).json({ message: 'Task updated successfully', task, subTasks: updatedSubTasks });
        } catch (error) {
          console.error('Error updating task:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
      
// Status update of task

router.put('/update-task-status', async (req, res) => {
    const { task_id } = req.query;
    const { status } = req.body;
  
    try {
      // Find the task to be updated
      const task = await Task.findByPk(task_id);
  
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
  
      // Update the task status
      task.status = status;
      await task.save();
  
      res.status(200).json({ message: 'Task status updated successfully', task });
    } catch (error) {
      console.error('Error updating task status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// Scearch Query for project api
router.get('/search-projects', async (req, res) => {
    const { query } = req.query;
  
    try {
      // Split the query into individual words
      const words = query.split(' ');
  
      // Create an array of conditions where each word must be present in project_name
      const conditions = words.map(word => ({
        project_name: {
          [Op.like]: `%${word}%` // Using like for case-insensitive search
        }
      }));
  
      // Search for projects that match all words in the query
      const projects = await Project.findAll({
        where: {
          [Op.and]: conditions
        },
        attributes: ['project_id', 'project_name'] // Select only project_id and project_name
      });
  
      res.status(200).json({ projects });
    } catch (error) {
      console.error('Error searching projects:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  


// scearch users

router.get('/search-users', async (req, res) => {
    const { query } = req.query;
    const EMPLOYEE_TYPE = 'employee'; // Define the constant here
  
    try {
      // Ensure the query parameter is provided
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
  
      // Split the query into individual words
      const words = query.split(' ');
  
      // Create an array of conditions where each word must be present in name
      const conditions = words.map(word => ({
        name: {
          [Op.like]: `%${word}%` // Using like for case-insensitive search
        }
      }));
  
      // Search for users that match all words in the query and user_type is 'employee'
      const users = await User.findAll({
        where: {
          [Op.and]: conditions,
          user_type: EMPLOYEE_TYPE // Use the constant here
        },
        attributes: ['user_id', 'name'] // Select only user_id and name
      });
  
      res.status(200).json({ users });
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



// Fetching of Todo Task
router.get('/fetch-todo-tasks', async (req, res) => {
    const { user_id } = req.query;
  
    try {
      // Fetch task IDs associated with the user
      const taskUsers = await TaskUser.findAll({
        where: { user_id },
        attributes: ['task_id']
      });
  
      const taskIds = taskUsers.map(taskUser => taskUser.task_id);
  
      if (taskIds.length === 0) {
        return res.status(200).json({ tasks: [] });
      }
  
      // Using raw SQL query to join Task and Project tables
      const tasks = await sequelize.query(
        `SELECT t.task_id, t.task_description, t.status, p.project_name
         FROM Task t
         INNER JOIN Project p ON t.project_id = p.project_id
         WHERE t.task_id IN (:taskIds) AND t.status = 'todo';`,
        {
          replacements: { taskIds },
          type: sequelize.QueryTypes.SELECT,
        }
      );
  
      res.status(200).json({ tasks });
    } catch (error) {
      console.error('Error fetching "To Do" tasks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// Fetching of In progress and in review Task
router.get('/fetch-progress-review-tasks', async (req, res) => {
    const { user_id } = req.query;
  
    try {
      // Fetch task IDs associated with the user
      const taskUsers = await TaskUser.findAll({
        where: { user_id },
        attributes: ['task_id']
      });
  
      const taskIds = taskUsers.map(taskUser => taskUser.task_id);
  
      if (taskIds.length === 0) {
        return res.status(200).json({ tasks: [] });
      }
  
      // Using raw SQL query to join Task and Project tables
      const tasks = await sequelize.query(
        `SELECT t.task_id, t.task_description, t.status, t.task_name, p.project_name
         FROM Task t
         INNER JOIN Project p ON t.project_id = p.project_id
         WHERE t.task_id IN (:taskIds) AND t.status IN ('inProgress', 'inReview');`,
        {
          replacements: { taskIds },
          type: sequelize.QueryTypes.SELECT,
        }
      );
  
      res.status(200).json({ tasks });
    } catch (error) {
      console.error('Error fetching "In Progress" and "In Review" tasks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });




// Fetching tasks based on project ID and separating by status
router.get('/fetchallquery', async (req, res) => {
  const { project_id } = req.query;

  if (!project_id) {
      return res.status(400).json({ error: 'Project ID is required' });
  }

  try {
      // Fetch tasks associated with the provided project ID
      const tasks = await Task.findAll({
          where: { project_id }
      });

      // Separate tasks based on their status
      const todoTasks = tasks.filter(task => task.status === 'todo');
      const inProgressTasks = tasks.filter(task => task.status === 'inProgress');
      const inReviewTasks = tasks.filter(task => task.status === 'inReview');
      const completedTasks = tasks.filter(task => task.status === 'completed');

      res.status(200).json({
          todoTasks,
          inProgressTasks,
          inReviewTasks,
          completedTasks
      });
  } catch (error) {
      console.error('Error fetching tasks by project ID:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


//fetch all tasks
router.get('/fetchallemployeetasks', async (req, res) => {
  try {
    // Fetch all tasks
    const tasks = await Task.findAll();
  
    // Extract task IDs from the result
    const taskIds = tasks.map(task => task.task_id);
  
    if (taskIds.length === 0) {
      return res.status(200).json({ tasks: [] });
    }
  
    // Fetch subtasks for the obtained tasks
    const subTasks = await SubTask.findAll({
      where: { task_id: taskIds }
    });
  
    // Map subtasks to their respective tasks
    const tasksWithSubTasks = tasks.map(task => {
      const taskSubTasks = subTasks.filter(subTask => subTask.task_id === task.task_id);
      return { ...task.toJSON(), subTasks: taskSubTasks };
    });
  
    res.status(200).json({ tasks: tasksWithSubTasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});







module.exports = router;
