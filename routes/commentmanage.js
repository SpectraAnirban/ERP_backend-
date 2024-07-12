const express = require('express');
const router = express.Router();
router.use(express.json());
const Comment = require('../models/Comment');

// Create a new comment
router.post('/comments', async (req, res) => {
    const { task_id, user_id, comment_text } = req.body;
    try {
      const newComment = await Comment.create({ task_id, user_id, comment_text });
      res.status(201).json(newComment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get all comments for a task
  router.get('/fetchallcomments/:task_id', async (req, res) => {
    const { task_id } = req.params;
    try {
      const comments = await Comment.findAll({ where: { task_id } });
      res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Update a comment (only if the user is the owner)
  router.put('/comments/:comment_id', async (req, res) => {
    const { comment_id } = req.params;
    const { user_id, comment_text } = req.body;
    try {
      const comment = await Comment.findOne({ where: { comment_id } });
  
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }
  
      if (comment.user_id !== user_id) {
        return res.status(403).json({ error: 'Forbidden: You can only edit your own comments' });
      }
  
      comment.comment_text = comment_text;
      await comment.save();
  
      res.status(200).json(comment);
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Delete a comment (only if the user is the owner)
  router.delete('/comments/:comment_id', async (req, res) => {
    const { comment_id } = req.params;
    const { user_id } = req.body;
    try {
      const comment = await Comment.findOne({ where: { comment_id } });
  
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }
  
      if (comment.user_id !== user_id) {
        return res.status(403).json({ error: 'Forbidden: You can only delete your own comments' });
      }
  
      await comment.destroy();
  
      res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



module.exports = router;