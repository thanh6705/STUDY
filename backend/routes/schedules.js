const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');

// @route   GET /api/schedules
// @desc    Lấy danh sách thời khóa biểu của user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    // Đã sửa userId -> user
    const schedules = await Schedule.find({ user: userId, isActive: true })
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    res.json(schedules);
  } catch (error) {
    console.error('Lỗi GET schedules:', error);
    res.status(500).json({ message: 'Không thể tải thời khóa biểu' });
  }
});

// @route   POST /api/schedules
// @desc    Thêm môn học mới
router.post('/', auth, async (req, res) => {
  try {
    const { subject, room, dayOfWeek, session, startTime, endTime, color } = req.body;
    const userId = req.user.id || req.user._id;

    if (!subject || !dayOfWeek || !session || !startTime || !endTime) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Đã sửa userId -> user
    const newSchedule = new Schedule({
      user: userId,
      subject,
      room: room || '',
      dayOfWeek,
      session,
      startTime,
      endTime,
      color: color || '#e3f2fd'
    });

    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    console.error('Lỗi POST schedule:', error);
    res.status(500).json({ message: 'Không thể tạo môn học' });
  }
});

// @route   PUT /api/schedules/:id
// @desc    Sửa môn học
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { subject, room, dayOfWeek, session, startTime, endTime, color } = req.body;

    // Đã sửa userId -> user
    const schedule = await Schedule.findOne({ _id: req.params.id, user: userId });

    if (!schedule) {
      return res.status(404).json({ message: 'Không tìm thấy môn học' });
    }

    schedule.subject = subject ?? schedule.subject;
    schedule.room = room ?? schedule.room;
    schedule.dayOfWeek = dayOfWeek ?? schedule.dayOfWeek;
    schedule.session = session ?? schedule.session;
    schedule.startTime = startTime ?? schedule.startTime;
    schedule.endTime = endTime ?? schedule.endTime;
    schedule.color = color ?? schedule.color;

    const updatedSchedule = await schedule.save();
    res.json(updatedSchedule);
  } catch (error) {
    console.error('Lỗi PUT schedule:', error);
    res.status(500).json({ message: 'Không thể cập nhật môn học' });
  }
});

// @route   DELETE /api/schedules/:id
// @desc    Xóa môn học
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Đã sửa userId -> user
    const schedule = await Schedule.findOneAndDelete({ _id: req.params.id, user: userId });

    if (!schedule) {
      return res.status(404).json({ message: 'Không tìm thấy môn học để xóa' });
    }

    res.json({ message: 'Đã xóa môn học thành công' });
  } catch (error) {
    console.error('Lỗi DELETE schedule:', error);
    res.status(500).json({ message: 'Không thể xóa môn học' });
  }
});

module.exports = router;