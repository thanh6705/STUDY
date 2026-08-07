const mongoose = require('mongoose');

const StudyRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  questionSetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionSet',
    required: true,
    index: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 0
  },
  answers: {
    type: [Number],
    default: []
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
StudyRecordSchema.index({ userId: 1, questionSetId: 1, createdAt: -1 });

module.exports = mongoose.model('StudyRecord', StudyRecordSchema);