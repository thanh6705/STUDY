import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit, FaThumbtack, FaSearch, FaFire, FaBookOpen } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ICONS = ['📝', '📚', '💡', '🔬', '📊', '💻', '📐', '🎵', '🎨', '🧪', '📖', '✏️'];
const COLORS = ['#ffffff', '#ffebee', '#f3e5f5', '#e8eaf6', '#e0f7fa', '#e8f5e9', '#fff3e0', '#fce4ec'];

function Home() {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    icon: '📝',
    color: '#ffffff'
  });
  const [selectedNote, setSelectedNote] = useState(null);
  const { user, token } = useAuth();

  const fetchNotes = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Không thể tải ghi chú');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [fetchNotes, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await axios.put(`${API_URL}/api/notes/${editingNote._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Cập nhật ghi chú thành công');
      } else {
        await axios.post(`${API_URL}/api/notes`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Tạo ghi chú thành công');
      }
      fetchNotes();
      setShowForm(false);
      setEditingNote(null);
      resetForm();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Không thể lưu ghi chú');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa ghi chú này?')) {
      try {
        await axios.delete(`${API_URL}/api/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchNotes();
        toast.success('Đã xóa ghi chú');
      } catch (error) {
        console.error('Error deleting note:', error);
        toast.error('Không thể xóa ghi chú');
      }
    }
  };

  const handlePin = async (note) => {
    try {
      await axios.put(`${API_URL}/api/notes/${note._id}`, {
        isPinned: !note.isPinned
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotes();
    } catch (error) {
      console.error('Error pinning note:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      icon: '📝',
      color: '#ffffff'
    });
  };

  // Lọc ghi chú theo từ khóa tìm kiếm
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home-container">
      {/* Banner Lời chào & Thống kê */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Chào {user?.username || 'bạn'}! 👋</h2>
          <p>Hôm nay bạn muốn ghi chú hay học môn gì?</p>
        </div>
        <div className="streak-badge">
          <FaFire className="fire-icon" /> <span>{notes.length} Ghi chú</span>
        </div>
      </div>

      {/* Thanh tìm kiếm & Nút tạo ghi chú */}
      <div className="home-action-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm ghi chú..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="create-note-btn" onClick={() => {
          resetForm();
          setEditingNote(null);
          setShowForm(true);
        }}>
          <FaPlus /> Tạo ghi chú
        </button>
      </div>

      {/* Danh sách ghi chú */}
      <div className="notes-grid">
        {filteredNotes.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon-wrapper">
              <FaBookOpen />
            </div>
            <h3>{searchTerm ? 'Không tìm thấy ghi chú phù hợp' : 'Chưa có ghi chú nào'}</h3>
            <p>{searchTerm ? 'Hãy thử tìm kiếm với từ khóa khác' : 'Lưu lại kiến thức quan trọng hoặc ý tưởng bài học ngay tại đây nhé!'}</p>
            {!searchTerm && (
              <button className="create-note-btn" onClick={() => {
                resetForm();
                setEditingNote(null);
                setShowForm(true);
              }}>
                <FaPlus /> Tạo ghi chú đầu tiên
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map(note => (
            <div 
              key={note._id} 
              className={`note-card ${note.isPinned ? 'pinned' : ''}`}
              style={{ backgroundColor: note.color || '#ffffff' }}
              onClick={() => setSelectedNote(note)}
            >
              <div className="note-card-header">
                <span className="note-icon">{note.icon}</span>
                <h3>{note.title}</h3>
                <div className="note-actions-header">
                  <button onClick={(e) => { e.stopPropagation(); handlePin(note); }}>
                    <FaThumbtack className={note.isPinned ? 'pinned-icon' : ''} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setEditingNote(note); setFormData(note); setShowForm(true); }}>
                    <FaEdit />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}>
                    <FaTrash />
                  </button>
                </div>
              </div>
              <p className="note-content-preview">
                {note.content.slice(0, 100)}
                {note.content.length > 100 && '...'}
              </p>
              <div className="note-footer">
                <small>{new Date(note.updatedAt).toLocaleDateString('vi-VN')}</small>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Chi tiết Ghi chú */}
      {selectedNote && (
        <div className="modal-overlay" onClick={() => setSelectedNote(null)}>
          <div className="modal-content note-detail" onClick={e => e.stopPropagation()}>
            <div className="note-detail-header">
              <span className="note-icon">{selectedNote.icon}</span>
              <h2>{selectedNote.title}</h2>
              <button className="close-btn" onClick={() => setSelectedNote(null)}>✕</button>
            </div>
            <div className="note-detail-content">
              {selectedNote.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
            <div className="note-detail-footer">
              <small>Cập nhật: {new Date(selectedNote.updatedAt).toLocaleString('vi-VN')}</small>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tạo/Sửa */}
      {showForm && (
        <div className="modal-overlay" onClick={() => {
          setShowForm(false);
          setEditingNote(null);
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editingNote ? '✏️ Sửa ghi chú' : '📝 Tạo ghi chú mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Chọn icon</label>
                <div className="icon-selector">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-btn ${formData.icon === icon ? 'selected' : ''}`}
                      onClick={() => setFormData({...formData, icon})}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Màu nền</label>
                <div className="color-selector">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-btn ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color, border: color === '#ffffff' ? '2px solid #ddd' : 'none' }}
                      onClick={() => setFormData({...formData, color})}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tiêu đề</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Nhập tiêu đề ghi chú"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nội dung</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Nhập nội dung ghi chú..."
                  rows={8}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setEditingNote(null);
                }}>Hủy</button>
                <button type="submit">{editingNote ? 'Cập nhật' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;