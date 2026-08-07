const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');

// Get all schedules
router.get('/', auth, async (req, res) => {
  try {
    const schedules = await Schedule.find({
      userId: req.userId,
      isActive: true
    }).sort({ dayOfWeek: 1, startTime: 1 });
    res.json(schedules);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get schedules by date range
router.get('/range', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const schedules = await Schedule.find({
      userId: req.userId,
      isActive: true,
      $or: [
        { 
          startDate: { $lte: new Date(endDate) }, 
          endDate: { $gte: new Date(startDate) } 
        },
        { 
          startDate: { $lte: new Date(endDate) }, 
          endDate: null 
        }
      ]
    });
    res.json(schedules);
  } catch (error) {
    console.error('Get schedules range error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create schedule
router.post('/', auth, [
  body('subject').trim().isLength({ min: 1, max: 100 }).withMessage('Subject is required'),
  body('dayOfWeek').isInt({ min: 2, max: 8 }).withMessage('Invalid day of week'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time'),
  body('session').isIn(['morning', 'afternoon', 'evening']).withMessage('Invalid session'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid end date'),
  body('repeat').optional().isIn(['none', 'daily', 'weekly', 'monthly']),
  body('repeatEndDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid repeat end date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    // Validate end time is after start time
    if (req.body.startTime >= req.body.endTime) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Validate end date is after start date if provided
    if (req.body.endDate && new Date(req.body.endDate) <= new Date(req.body.startDate)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const parseDateOnly = (dateValue) => {
      return dateValue ? new Date(`${dateValue}T00:00`) : null;
    };

    const schedule = new Schedule({
      ...req.body,
      userId: req.userId,
      startDate: parseDateOnly(req.body.startDate),
      endDate: parseDateOnly(req.body.endDate),
      repeatEndDate: parseDateOnly(req.body.repeatEndDate)
    });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update schedule
router.put('/:id', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete schedule
router.delete('/:id', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle active status
router.put('/:id/toggle', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ _id: req.params.id, userId: req.userId });
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    schedule.isActive = !schedule.isActive;
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    console.error('Toggle schedule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;