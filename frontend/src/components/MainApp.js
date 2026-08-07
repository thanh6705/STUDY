import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBook, 
  FaCalendarAlt, 
  FaQuestionCircle, 
  FaCog, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaClock, 
  FaTasks 
} from 'react-icons/fa';
import Home from './Home';
import Schedule from './Schedule';
import QuestionSets from './QuestionSets';
import Settings from './Settings';
import { useAuth } from '../context/AuthContext';
import './MainApp.css';

// Component tạm thời cho Tab Pomodoro
function PomodoroTab() {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
      <h2>⏱️ Đồng hồ Pomodoro</h2>
      <p style={{ color: '#666', marginTop: '8px' }}>Tính năng hỗ trợ tập trung học tập 25 phút chuẩn bị ra mắt!</p>
    </div>
  );
}

// Component tạm thời cho Tab To-Do List
function TodoTab() {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
      <h2>✅ Quản lý Bài tập & Deadline</h2>
      <p style={{ color: '#666', marginTop: '8px' }}>Tính năng lập danh sách công việc và đếm ngược deadline chuẩn bị ra mắt!</p>
    </div>
  );
}

function MainApp() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State quản lý việc mở/đóng Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tự động đóng menu khi chuyển trang trên Mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="main-app">
      {/* Overlay phủ mờ màn hình khi mở menu trên Mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">📚</span>
            <span className="brand-text">Study Note Hub</span>
          </div>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/app" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaBook />
            <span>Trang chủ</span>
          </NavLink>

          <NavLink to="/app/schedule" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaCalendarAlt />
            <span>Lịch học</span>
          </NavLink>

          <NavLink to="/app/questions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaQuestionCircle />
            <span>Ôn tập</span>
          </NavLink>

          <NavLink to="/app/pomodoro" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaClock />
            <span>Pomodoro</span>
          </NavLink>

          <NavLink to="/app/todo" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaTasks />
            <span>Bài tập / To-do</span>
          </NavLink>

          <NavLink to="/app/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaCog />
            <span>Cài đặt</span>
          </NavLink>

          <button className="sidebar-link logout" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Đăng xuất</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="app-header">
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <div className="header-content">
            <h1>Study Note Hub</h1>
            <p>Ghi chú học tập thông minh</p>
          </div>
        </header>
        
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/questions" element={<QuestionSets />} />
            <Route path="/pomodoro" element={<PomodoroTab />} />
            <Route path="/todo" element={<TodoTab />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default MainApp;