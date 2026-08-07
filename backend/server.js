const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (ĐÃ SỬA CẤU HÌNH CORS TẠI ĐÂY)
app.use(cors({
  origin: '*', // Cho phép Netlify và các nguồn khác gọi tới API
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/study_note_hub', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Routes
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const scheduleRoutes = require('./routes/schedules');
const questionSetRoutes = require('./routes/questionSets');
const studyRecordRoutes = require('./routes/studyRecords');

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/questionsets', questionSetRoutes);
app.use('/api/studyrecords', studyRecordRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});