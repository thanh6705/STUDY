const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const QuestionSet = require('../models/QuestionSet');
const auth = require('../middleware/auth');

// Get all question sets
router.get('/', auth, async (req, res) => {
  try {
    const questionSets = await QuestionSet.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(questionSets);
  } catch (error) {
    console.error('Get question sets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single question set
router.get('/:id', auth, async (req, res) => {
  try {
    const questionSet = await QuestionSet.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!questionSet) {
      return res.status(404).json({ error: 'Question set not found' });
    }
    res.json(questionSet);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create question set
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
  body('description').optional().isLength({ max: 500 }),
  body('questions').isArray().withMessage('Questions must be an array'),
  body('questions.*.question').trim().notEmpty().withMessage('Question text is required'),
  body('questions.*.options').isArray({ min: 4, max: 4 }).withMessage('Each question must have 4 options'),
  body('questions.*.options.*').trim().notEmpty().withMessage('Option cannot be empty'),
  body('questions.*.correctAnswer').isInt({ min: 0, max: 3 }).withMessage('Correct answer must be 0-3')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    // Validate max 80 questions
    if (req.body.questions.length > 80) {
      return res.status(400).json({ error: 'Maximum 80 questions allowed' });
    }

    const questionSet = new QuestionSet({
      ...req.body,
      userId: req.userId,
      totalQuestions: req.body.questions.length
    });
    await questionSet.save();
    res.status(201).json(questionSet);
  } catch (error) {
    console.error('Create question set error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update question set
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('questions').optional().isArray(),
  body('questions.*.question').optional().trim().notEmpty(),
  body('questions.*.options').optional().isArray({ min: 4, max: 4 }),
  body('questions.*.correctAnswer').optional().isInt({ min: 0, max: 3 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    // Validate max 80 questions if updating
    if (req.body.questions && req.body.questions.length > 80) {
      return res.status(400).json({ error: 'Maximum 80 questions allowed' });
    }

    const questionSet = await QuestionSet.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 
        ...req.body,
        ...(req.body.questions && { totalQuestions: req.body.questions.length }),
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true }
    );
    if (!questionSet) {
      return res.status(404).json({ error: 'Question set not found' });
    }
    res.json(questionSet);
  } catch (error) {
    console.error('Update question set error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete question set
router.delete('/:id', auth, async (req, res) => {
  try {
    const questionSet = await QuestionSet.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!questionSet) {
      return res.status(404).json({ error: 'Question set not found' });
    }
    res.json({ message: 'Question set deleted successfully' });
  } catch (error) {
    console.error('Delete question set error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;