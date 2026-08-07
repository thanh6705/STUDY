const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 2,
    max: 8
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  session: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: null
  },
  repeat: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  repeatEndDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
ScheduleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

ScheduleSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Index for efficient queries
ScheduleSchema.index({ userId: 1, startDate: 1, endDate: 1 });
ScheduleSchema.index({ userId: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Schedule', ScheduleSchema);