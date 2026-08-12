import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaClock, FaEraser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './NoteEditor.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ICONS = ['📝', '📚', '💡', '🔬', '📊', '💻', '📐', '🎵', '🎨', '🧪', '📖', '✏️'];
const COLORS = [
  { name: 'Mặc định', hex: '#ffffff' },
  { name: 'Hồng nhạt', hex: '#ffebee' },
  { name: 'Tím nhạt', hex: '#f3e5f5' },
  { name: 'Xanh lam', hex: '#e8eaf6' },
  { name: 'Xanh ngọc', hex: '#e0f7fa' },
  { name: 'Xanh lá', hex: '#e8f5e9' },
  { name: 'Cam nhạt', hex: '#fff3e0' },
  { name: 'Hồng đào', hex: '#fce4ec' }
];

function NoteEditor() {
  const { id } = useParams(); // Nếu có id -> đang sửa ghi chú
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    icon: '📝',
    color: '#ffffff'
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nếu là chế độ sửa, lấy dữ liệu ghi chú cũ từ API
  const fetchNoteDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setFormData({
          title: response.data.title || '',
          content: response.data.content || '',
          icon: response.data.icon || '📝',
          color: response.data.color || '#ffffff'
        });
      }
    } catch (error) {
      console.error('Error fetching note detail:', error);
      toast.error('Không thể tải thông tin ghi chú');
      navigate('/app');
    } finally {
      setLoading(false);
    }
  }, [id, token, navigate]);

  useEffect(() => {
    fetchNoteDetail();
  }, [fetchNoteDetail]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề ghi chú');
      return;
    }

    setIsSubmitting(true);
    try {
      if (id) {
        await axios.put(`${API_URL}/api/notes/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Cập nhật ghi chú thành công!');
      } else {
        await axios.post(`${API_URL}/api/notes`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Tạo ghi chú mới thành công!');
      }
      navigate('/app'); // Lưu xong về thẳng Trang chủ để hiện danh sách
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Không thể lưu ghi chú');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tiện ích: Chèn mốc thời gian hiện tại vào nội dung
  const insertTimestamp = () => {
    const now = new Date().toLocaleString('vi-VN');
    setFormData(prev => ({
      ...prev,
      content: prev.content + (prev.content ? '\n' : '') + `[📌 ${now}]: `
    }));
  };

  // Tiện ích: Xóa trắng nhanh nội dung
  const clearContent = () => {
    if (window.confirm('Bạn có chắc muốn xóa hết nội dung văn bản?')) {
      setFormData(prev => ({ ...prev, content: '' }));
    }
  };

  // Tính số từ và ký tự
  const wordCount = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;
  const charCount = formData.content.length;

  if (loading) {
    return <div className="editor-loading">Đang tải ghi chú...</div>;
  }

  return (
    <div className="note-editor-container" style={{ backgroundColor: formData.color }}>
      {/* Thanh điều hướng & Thao tác trên cùng */}
      <div className="editor-top-bar">
        <button className="back-btn" onClick={() => navigate('/app')}>
          <FaArrowLeft /> Trở về Trang chủ
        </button>
        <div className="editor-title-status">
          <span>{id ? '✏️ Đang chỉnh sửa ghi chú' : '📝 Tạo ghi chú mới'}</span>
        </div>
        <button 
          className="save-note-btn" 
          onClick={handleSubmit} 
          disabled={isSubmitting}
        >
          <FaSave /> {isSubmitting ? 'Đang lưu...' : 'Lưu ghi chú'}
        </button>
      </div>

      {/* Thanh Tiện Ích (Toolbar) */}
      <div className="editor-toolbar">
        <div className="toolbar-section">
          <label>Icon đại diện:</label>
          <div className="icon-picker">
            {ICONS.map(icon => (
              <button
                key={icon}
                type="button"
                className={`icon-item ${formData.icon === icon ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, icon })}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-section">
          <label>Màu trang trí:</label>
          <div className="color-picker">
            {COLORS.map(c => (
              <button
                key={c.hex}
                type="button"
                title={c.name}
                className={`color-item ${formData.color === c.hex ? 'active' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setFormData({ ...formData, color: c.hex })}
              />
            ))}
          </div>
        </div>

        <div className="toolbar-section tools-actions">
          <label>Công cụ nhanh:</label>
          <div className="quick-tools">
            <button type="button" onClick={insertTimestamp} title="Chèn thời gian hiện tại">
              <FaClock /> Chèn thời gian
            </button>
            <button type="button" onClick={clearContent} title="Xóa toàn bộ nội dung">
              <FaEraser /> Xóa nhanh
            </button>
          </div>
        </div>
      </div>

      {/* Khu vực soạn thảo chính (Full khổ rộng) */}
      <div className="editor-workspace">
        <input
          type="text"
          className="editor-title-input"
          placeholder="Nhập tiêu đề ghi chú tại đây..."
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <textarea
          className="editor-textarea"
          placeholder="Bắt đầu nhập nội dung ghi chú của bạn..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        />
      </div>

      {/* Thanh thống kê dưới chân trang */}
      <div className="editor-footer-bar">
        <div className="stats">
          <span>Số từ: <strong>{wordCount}</strong></span>
          <span className="divider">•</span>
          <span>Số ký tự: <strong>{charCount}</strong></span>
        </div>
      </div>
    </div>
  );
}

export default NoteEditor;