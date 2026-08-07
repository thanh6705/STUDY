const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

// Get all notes
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId })
      .sort({ isPinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single note
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create note
router.post('/', auth, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and max 200 characters'),
  body('content').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const note = new Note({
      ...req.body,
      userId: req.userId
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update note
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ max: 200 }),
  body('content').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle pin
router.put('/:id/pin', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    note.isPinned = !note.isPinned;
    await note.save();
    res.json(note);
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;