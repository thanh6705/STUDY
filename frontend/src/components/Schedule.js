import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { FaPlus, FaTrash, FaEdit, FaTimes, FaEye } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Schedule.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const SESSIONS = [
  { value: 'morning', label: 'Sáng', times: ['07:00', '08:00', '09:00', '10:00', '11:00'] },
  { value: 'afternoon', label: 'Chiều', times: ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
  { value: 'evening', label: 'Tối', times: ['19:00', '20:00', '21:00', '22:00', '23:00'] }
];

function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    dayOfWeek: 2,
    startTime: '08:00',
    endTime: '09:00',
    session: 'morning',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    repeat: 'none',
    repeatEndDate: ''
  });
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [formError, setFormError] = useState('');
  const { token } = useAuth();

  const fetchSchedules = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/schedules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Không thể tải lịch học');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSchedules();
    }
  }, [fetchSchedules, token]);

  const getWeekDays = (date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const getSchedulesForDay = (date) => {
    const normalizedDate = startOfDay(date);
    const dayOfWeek = normalizedDate.getDay() === 0 ? 8 : normalizedDate.getDay() + 1;

    return schedules.filter(schedule => {
      if (!schedule.isActive) return false;

      const startDate = parseDateString(schedule.startDate);
      const endDate = schedule.endDate ? parseDateString(schedule.endDate) : new Date(2100, 11, 31);
      const isInRange = isWithinInterval(normalizedDate, { start: startDate, end: endDate });
      if (!isInRange) return false;

      if (schedule.repeat === 'none') {
        return isSameDay(normalizedDate, startDate);
      }

      if (schedule.repeat === 'daily') {
        return normalizedDate >= startDate;
      }

      if (schedule.repeat === 'weekly') {
        return normalizedDate >= startDate && schedule.dayOfWeek === dayOfWeek;
      }

      if (schedule.repeat === 'monthly') {
        return normalizedDate >= startDate && normalizedDate.getDate() === startDate.getDate();
      }

      return false;
    });
  };

  const weekDays = getWeekDays(currentWeek);

  const closeForm = () => {
    setShowForm(false);
    setEditingSchedule(null);
    setFormError('');
  };

  const parseDateValue = (value) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return trimmed;
  };

  const parseDateString = (value) => {
    if (!value) return null;
    if (value instanceof Date) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(`${value}T00:00`);
    }
    const parsed = new Date(value);
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
  };

  const getDayOfWeekFromDate = (dateString) => {
    const date = parseDateString(dateString);
    if (!date) return 2;
    return date.getDay() === 0 ? 8 : date.getDay() + 1;
  };

  const getDayName = (dayOfWeek) => {
    if (dayOfWeek === 8) return 'Chủ nhật';
    return DAYS[dayOfWeek - 2] || '';
  };

  const handleCreateForDate = (date, e) => {
    e.stopPropagation();
    const normalizedDate = startOfDay(date);
    const dayOfWeek = normalizedDate.getDay() === 0 ? 8 : normalizedDate.getDay() + 1;
    setSelectedDate(normalizedDate);
    setCurrentWeek(normalizedDate);
    resetForm();
    setEditingSchedule(null);
    setFormData(prev => ({
      ...prev,
      dayOfWeek,
      startDate: format(normalizedDate, 'yyyy-MM-dd')
    }));
    setShowForm(true);
  };

  const handleViewDate = (date, e) => {
    e.stopPropagation();
    const normalizedDate = startOfDay(date);
    setSelectedDate(normalizedDate);
    setCurrentWeek(normalizedDate);
  };

  const isDateInPast = (dateString) => {
    if (!dateString) return false;
    const parsed = parseISO(dateString);
    return startOfDay(parsed) < startOfDay(new Date());
  };

  const buildSchedulePayload = () => {
    const payload = {
      subject: formData.subject.trim(),
      dayOfWeek: formData.dayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      session: formData.session,
      startDate: parseDateValue(formData.startDate),
      repeat: formData.repeat
    };

    if (formData.endDate) {
      payload.endDate = parseDateValue(formData.endDate);
    }
    if (formData.repeatEndDate) {
      payload.repeatEndDate = parseDateValue(formData.repeatEndDate);
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      setFormError('Vui lòng nhập tên môn học');
      toast.error('Vui lòng nhập tên môn học');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setFormError('Giờ kết thúc phải lớn hơn giờ bắt đầu');
      toast.error('Giờ kết thúc phải lớn hơn giờ bắt đầu');
      return;
    }

    if (isDateInPast(formData.startDate)) {
      setFormError('Ngày bắt đầu không thể là ngày đã qua');
      toast.error('Ngày bắt đầu không thể là ngày đã qua');
      return;
    }

    if (formData.endDate && parseDateValue(formData.endDate) <= parseDateValue(formData.startDate)) {
      setFormError('Ngày kết thúc phải sau ngày bắt đầu');
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    if (formData.repeat !== 'none' && formData.repeatEndDate && parseDateValue(formData.repeatEndDate) <= parseDateValue(formData.startDate)) {
      setFormError('Ngày kết thúc lặp lại phải sau ngày bắt đầu');
      toast.error('Ngày kết thúc lặp lại phải sau ngày bắt đầu');
      return;
    }

    try {
      const data = buildSchedulePayload();
      
      if (editingSchedule) {
        await axios.put(`${API_URL}/api/schedules/${editingSchedule._id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Cập nhật lịch học thành công');
      } else {
        await axios.post(`${API_URL}/api/schedules`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Thêm lịch học thành công');
      }
      
      fetchSchedules();
      closeForm();
      resetForm();
    } catch (error) {
      console.error('Error saving schedule:', error);
      const message = error.response?.data?.error || error.message || 'Không thể lưu lịch học';
      toast.error(message);
      setFormError(message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa lịch học này?')) {
      try {
        await axios.delete(`${API_URL}/api/schedules/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSchedules();
        toast.success('Đã xóa lịch học');
      } catch (error) {
        console.error('Error deleting schedule:', error);
        toast.error('Không thể xóa lịch học');
      }
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      subject: schedule.subject,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      session: schedule.session,
      startDate: format(new Date(schedule.startDate), 'yyyy-MM-dd'),
      endDate: schedule.endDate ? format(new Date(schedule.endDate), 'yyyy-MM-dd') : '',
      repeat: schedule.repeat,
      repeatEndDate: schedule.repeatEndDate ? format(new Date(schedule.repeatEndDate), 'yyyy-MM-dd') : ''
    });
    setFormError('');
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      dayOfWeek: 2,
      startTime: '08:00',
      endTime: '09:00',
      session: 'morning',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      repeat: 'none',
      repeatEndDate: ''
    });
  };

  const getSessionLabel = (session) => {
    return SESSIONS.find(s => s.value === session)?.label || session;
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>📅 Lịch học</h2>
        <button className="add-schedule-btn" onClick={() => {
          resetForm();
          setEditingSchedule(null);
          setShowForm(true);
        }}>
          <FaPlus /> Thêm lịch học
        </button>
      </div>

      <div className="schedule-content">
        <div className="timetable-section">
          <div className="timetable-header">
            <h3>Thời khóa biểu</h3>
            <div className="week-navigation">
              <button onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))}>
                ◀
              </button>
              <span>
                {format(weekDays[0], 'dd/MM/yyyy')} - {format(weekDays[6], 'dd/MM/yyyy')}
              </span>
              <button onClick={() => setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))}>
                ▶
              </button>
            </div>
          </div>

          <div className="timetable-grid">
            <div className="timetable-row header-row">
              <div className="timetable-cell time-cell">Giờ</div>
              {DAYS.map((day, index) => (
                <div key={index} className="timetable-cell day-cell">
                  {day}
                  <br />
                  <small>{format(weekDays[index], 'dd/MM')}</small>
                </div>
              ))}
            </div>

            {SESSIONS.map(session => (
              <div key={session.value} className="timetable-session">
                <div className="session-label">{session.label}</div>
                {session.times.map(time => (
                  <div key={time} className="timetable-row">
                    <div className="timetable-cell time-cell">{time}</div>
                    {weekDays.map((day, dayIndex) => {
                      const daySchedules = getSchedulesForDay(day);
                      const schedule = daySchedules.find(s => 
                        s.startTime <= time && s.endTime > time && s.session === session.value
                      );
                      return (
                        <div key={dayIndex} className="timetable-cell subject-cell">
                          {schedule && (
                            <div className="subject-block" style={{ backgroundColor: '#667eea20' }}>
                              <strong>{schedule.subject}</strong>
                              <br />
                              <small>{schedule.startTime} - {schedule.endTime}</small>
                            </div>
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

        <div className="calendar-section">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={({ date }) => {
              const daySchedules = getSchedulesForDay(date);
              return (
                <div className="tile-inner">
                  {daySchedules.length > 0 && (
                    <div className="event-dot">
                      <span className="dot"></span>
                    </div>
                  )}
                  <div className="tile-actions">
                    <button type="button" className="tile-action" onClick={(e) => handleViewDate(date, e)} title="Xem ngày">
                      <FaEye />
                    </button>
                    <button type="button" className="tile-action" onClick={(e) => handleCreateForDate(date, e)} title="Thêm lịch">
                      <FaPlus />
                    </button>
                  </div>
                </div>
              );
            }}
            tileClassName={({ date }) => {
              const daySchedules = getSchedulesForDay(date);
              return daySchedules.length > 0 ? 'event-day' : '';
            }}
            onClickDay={(date) => {
              const normalizedDate = startOfDay(date);
              const dayOfWeek = normalizedDate.getDay() === 0 ? 8 : normalizedDate.getDay() + 1;
              setSelectedDate(normalizedDate);
              setCurrentWeek(normalizedDate);
              resetForm();
              setEditingSchedule(null);
              setFormData(prev => ({
                ...prev,
                dayOfWeek,
                startDate: format(normalizedDate, 'yyyy-MM-dd')
              }));
              setShowForm(true);
            }}
            tileDisabled={({ date }) => startOfDay(date) < startOfDay(new Date())}
          />
          <div className="day-schedules">
            <h3>Lịch trong ngày {format(selectedDate, 'dd/MM/yyyy')}</h3>
            {getSchedulesForDay(selectedDate).length === 0 ? (
              <p className="no-schedule">Chưa có lịch học cho ngày này.</p>
            ) : (
              <ul className="schedule-list">
                {getSchedulesForDay(selectedDate).map(schedule => (
                  <li key={schedule._id} className="schedule-item">
                    <div className="schedule-info">
                      <span className="subject">{schedule.subject}</span>
                      <span className="time">{schedule.startTime} - {schedule.endTime}</span>
                      <span className="session-badge">{getSessionLabel(schedule.session)}</span>
                      {schedule.repeat !== 'none' && (
                        <span className="repeat-badge">
                          {schedule.repeat === 'daily' ? 'Hàng ngày' :
                           schedule.repeat === 'weekly' ? 'Hàng tuần' :
                           'Hàng tháng'}
                        </span>
                      )}
                    </div>
                    <div className="schedule-actions">
                      <button className="edit-btn" onClick={() => handleEdit(schedule)}>
                        <FaEdit />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(schedule._id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSchedule ? '✏️ Sửa lịch học' : '📚 Thêm lịch học mới'}</h3>
              <button type="button" className="modal-close-btn" onClick={closeForm} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-group">
                <label>Tên môn học</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Nhập tên môn học"
                  required
                />
              </div>

              <div className="form-group">
                <label>Ngày trong tuần</label>
                <input
                  type="text"
                  value={getDayName(formData.dayOfWeek)}
                  disabled
                />
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
                <label>Buổi học</label>
                <select
                  value={formData.session}
                  onChange={(e) => setFormData({...formData, session: e.target.value})}
                  required
                >
                  {SESSIONS.map(session => (
                    <option key={session.value} value={session.value}>{session.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setFormData({...formData, startDate: newDate, dayOfWeek: getDayOfWeekFromDate(newDate)});
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc (không bắt buộc)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Lặp lại</label>
                <select
                  value={formData.repeat}
                  onChange={(e) => setFormData({...formData, repeat: e.target.value})}
                >
                  <option value="none">Không lặp</option>
                  <option value="daily">Hàng ngày</option>
                  <option value="weekly">Hàng tuần</option>
                  <option value="monthly">Hàng tháng</option>
                </select>
              </div>

              {formData.repeat !== 'none' && (
                <div className="form-group">
                  <label>Ngày kết thúc lặp lại (không bắt buộc)</label>
                  <input
                    type="date"
                    value={formData.repeatEndDate}
                    onChange={(e) => setFormData({...formData, repeatEndDate: e.target.value})}
                  />
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={closeForm}>Hủy</button>
                <button type="submit">{editingSchedule ? 'Cập nhật' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;