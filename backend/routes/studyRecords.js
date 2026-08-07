const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const StudyRecord = require('../models/StudyRecord');
const auth = require('../middleware/auth');

// Get all study records for user
router.get('/', auth, async (req, res) => {
  try {
    const records = await StudyRecord.find({ userId: req.userId })
      .populate('questionSetId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(records);
  } catch (error) {
    console.error('Get study records error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get study records for a specific question set
router.get('/set/:questionSetId', auth, async (req, res) => {
  try {
    const records = await StudyRecord.find({
      userId: req.userId,
      questionSetId: req.params.questionSetId
    }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    console.error('Get study records by set error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create study record
router.post('/', auth, [
  body('questionSetId').notEmpty().withMessage('Question set ID is required'),
  body('score').isInt({ min: 0 }).withMessage('Score must be a positive number'),
  body('totalQuestions').isInt({ min: 1 }).withMessage('Total questions must be at least 1'),
  body('answers').optional().isArray(),
  body('timeSpent').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const record = new StudyRecord({
      ...req.body,
      userId: req.userId
    });
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    console.error('Create study record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get statistics for a question set
router.get('/stats/:questionSetId', auth, async (req, res) => {
  try {
    const records = await StudyRecord.find({
      userId: req.userId,
      questionSetId: req.params.questionSetId
    });

    if (records.length === 0) {
      return res.json({
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        recentAttempts: []
      });
    }

    const scores = records.map(r => r.score);
    const totalAttempts = records.length;
    const averageScore = scores.reduce((a, b) => a + b, 0) / totalAttempts;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    res.json({
      totalAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore,
      lowestScore,
      recentAttempts: records.slice(0, 5).map(r => ({
        score: r.score,
        totalQuestions: r.totalQuestions,
        timeSpent: r.timeSpent,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Get study stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete study record
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await StudyRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!record) {
      return res.status(404).json({ error: 'Study record not found' });
    }
    res.json({ message: 'Study record deleted successfully' });
  } catch (error) {
    console.error('Delete study record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;