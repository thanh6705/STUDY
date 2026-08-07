const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(array) {
        return array.length === 4 && array.every(opt => opt.trim().length > 0);
      },
      message: 'Must have exactly 4 non-empty options'
    }
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  }
});

const QuestionSetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  questions: {
    type: [QuestionSchema],
    validate: {
      validator: function(array) {
        return array.length <= 80;
      },
      message: 'Maximum 80 questions allowed'
    }
  },
  totalQuestions: {
    type: Number,
    default: 0
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

// Update totalQuestions before save
QuestionSetSchema.pre('save', function(next) {
  this.totalQuestions = this.questions.length;
  this.updatedAt = Date.now();
  next();
});

QuestionSetSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('QuestionSet', QuestionSetSchema);