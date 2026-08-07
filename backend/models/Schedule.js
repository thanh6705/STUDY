const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  user: {
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
  room: {
    type: String,
    default: '',
    trim: true,
    maxlength: 50
  },
  dayOfWeek: {
    type: Number, // 2 = Thứ 2, 3 = Thứ 3, ..., 8 = Chủ nhật
    required: true,
    min: 2,
    max: 8
  },
  session: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    required: true
  },
  startTime: {
    type: String, // Định dạng "HH:mm" (ví dụ: "07:00")
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String, // Định dạng "HH:mm" (ví dụ: "08:00")
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  color: {
    type: String,
    default: '#e3f2fd'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Tự động tạo createdAt và updatedAt
});

// Index tối ưu tốc độ truy vấn theo user và thứ trong tuần
scheduleSchema.index({ user: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);