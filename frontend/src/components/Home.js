import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaEdit, FaThumbtack, FaSearch, FaFire, FaBookOpen } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Home() {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();

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

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home-container">
      {/* Banner Lời chào */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Chào {user?.username || 'bạn'}! 👋</h2>
          <p>Hôm nay bạn muốn ghi chú hay học môn gì?</p>
        </div>
        <div className="streak-badge">
          <FaFire className="fire-icon" /> <span>{notes.length} Ghi chú</span>
        </div>
      </div>

      {/* Thanh tìm kiếm & Nút Tạo ghi chú (Dẫn sang Trang mới) */}
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
        <button className="create-note-btn" onClick={() => navigate('/app/note/create')}>
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
              <button className="create-note-btn" onClick={() => navigate('/app/note/create')}>
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
                  <button title="Ghim ghi chú" onClick={(e) => { e.stopPropagation(); handlePin(note); }}>
                    <FaThumbtack className={note.isPinned ? 'pinned-icon' : ''} />
                  </button>
                  {/* Nút sửa chuyển hướng sang trang Editor theo ID */}
                  <button title="Sửa ghi chú" onClick={(e) => { e.stopPropagation(); navigate(`/app/note/edit/${note._id}`); }}>
                    <FaEdit />
                  </button>
                  <button title="Xóa ghi chú" onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}>
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

      {/* Modal Chi tiết Ghi chú (Chỉ xem) */}
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
              <button 
                className="create-note-btn" 
                style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '13px' }}
                onClick={() => navigate(`/app/note/edit/${selectedNote._id}`)}
              >
                <FaEdit /> Mở bản sửa đầy đủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;