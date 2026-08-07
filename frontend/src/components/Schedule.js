import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Schedule.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DAYS = [
  { id: 2, label: 'Thứ 2' },
  { id: 3, label: 'Thứ 3' },
  { id: 4, label: 'Thứ 4' },
  { id: 5, label: 'Thứ 5' },
  { id: 6, label: 'Thứ 6' },
  { id: 7, label: 'Thứ 7' },
  { id: 8, label: 'Chủ nhật' }
];

const SESSIONS = [
  { value: 'morning', label: 'Sáng', times: ['07:00', '08:00', '09:00', '10:00', '11:00'] },
  { value: 'afternoon', label: 'Chiều', times: ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
  { value: 'evening', label: 'Tối', times: ['19:00', '20:00', '21:00', '22:00'] }
];

const COLORS = ['#e3f2fd', '#f3e5f5', '#e8f5e9', '#fff3e0', '#ffebee', '#e0f7fa'];

function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    room: '',
    dayOfWeek: 2,
    startTime: '07:00',
    endTime: '08:00',
    session: 'morning',
    color: '#e3f2fd'
  });

  const { token } = useAuth();

  const fetchSchedules = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/schedules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Không thể tải thời khóa biểu');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSchedules();
    }
  }, [fetchSchedules, token]);

  const handleCellClick = (dayId, time, sessionValue) => {
    const existing = schedules.find(
      s => s.dayOfWeek === dayId && s.startTime === time && s.session === sessionValue
    );

    if (existing) {
      handleEdit(existing);
    } else {
      // Tự động cộng 1 giờ cho giờ kết thúc
      const hour = parseInt(time.split(':')[0], 10);
      const endHour = (hour + 1).toString().padStart(2, '0') + ':00';

      setEditingSchedule(null);
      setFormData({
        subject: '',
        room: '',
        dayOfWeek: dayId,
        startTime: time,
        endTime: endHour,
        session: sessionValue,
        color: '#e3f2fd'
      });
      setShowForm(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error('Vui lòng nhập tên môn học');
      return;
    }

    try {
      if (editingSchedule) {
        await axios.put(`${API_URL}/api/schedules/${editingSchedule._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Cập nhật thành công');
      } else {
        await axios.post(`${API_URL}/api/schedules`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Thêm môn học thành công');
      }

      fetchSchedules();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Có lỗi xảy ra khi lưu');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Xóa môn học này khỏi thời khóa biểu?')) {
      try {
        await axios.delete(`${API_URL}/api/schedules/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSchedules();
        toast.success('Đã xóa');
        if (editingSchedule && editingSchedule._id === id) {
          setShowForm(false);
        }
      } catch (error) {
        toast.error('Không thể xóa');
      }
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      subject: schedule.subject || '',
      room: schedule.room || '',
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      session: schedule.session,
      color: schedule.color || '#e3f2fd'
    });
    setShowForm(true);
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>📅 Thời khóa biểu cố định</h2>
        <button 
          className="add-schedule-btn" 
          onClick={() => {
            setEditingSchedule(null);
            setFormData({
              subject: '',
              room: '',
              dayOfWeek: 2,
              startTime: '07:00',
              endTime: '08:00',
              session: 'morning',
              color: '#e3f2fd'
            });
            setShowForm(true);
          }}
        >
          <FaPlus /> Thêm môn học
        </button>
      </div>

      <div className="timetable-section full-width">
        <div className="timetable-grid">
          {/* Header Thứ */}
          <div className="timetable-row header-row">
            <div className="timetable-cell time-cell">Giờ / Thứ</div>
            {DAYS.map(day => (
              <div key={day.id} className="timetable-cell day-cell">
                {day.label}
              </div>
            ))}
          </div>

          {/* Các buổi học */}
          {SESSIONS.map(session => (
            <div key={session.value} className="timetable-session">
              <div className="session-label">{session.label}</div>
              {session.times.map(time => (
                <div key={time} className="timetable-row">
                  <div className="timetable-cell time-cell">{time}</div>
                  {DAYS.map(day => {
                    const matchSchedule = schedules.find(
                      s => s.dayOfWeek === day.id && s.startTime <= time && s.endTime > time
                    );

                    return (
                      <div 
                        key={day.id} 
                        className="timetable-cell subject-cell"
                        onClick={() => handleCellClick(day.id, time, session.value)}
                      >
                        {matchSchedule ? (
                          <div 
                            className="subject-card" 
                            style={{ backgroundColor: matchSchedule.color || '#e3f2fd' }}
                          >
                            <span className="subject-name">{matchSchedule.subject}</span>
                            {matchSchedule.room && <small className="subject-room">📍 {matchSchedule.room}</small>}
                            <div className="card-actions">
                              <button onClick={(e) => handleDelete(matchSchedule._id, e)}>
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="add-hint">+</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSchedule ? '✏️ Sửa môn học' : '📚 Thêm môn học'}</h3>
              <button className="modal-close-btn" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên môn học</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Ví dụ: Toán cao cấp, Tiếng Anh..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Phòng học / Địa điểm</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  placeholder="Ví dụ: A2.101, Zoom..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thứ</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({...formData, dayOfWeek: Number(e.target.value)})}
                  >
                    {DAYS.map(d => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Buổi</label>
                  <select
                    value={formData.session}
                    onChange={(e) => setFormData({...formData, session: e.target.value})}
                  >
                    {SESSIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giờ bắt đầu</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Giờ kết thúc</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Màu hiển thị</label>
                <div className="color-options" style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {COLORS.map(c => (
                    <div
                      key={c}
                      onClick={() => setFormData({...formData, color: c})}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        cursor: 'pointer',
                        border: formData.color === c ? '2px solid #667eea' : '1px solid #ccc'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit">{editingSchedule ? 'Cập nhật' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;