const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '📝'
  },
  color: {
    type: String,
    default: '#ffffff'
  },
  isPinned: {
    type: Boolean,
    default: false
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
NoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

NoteSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Note', NoteSchema);