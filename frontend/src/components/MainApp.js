import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { FaBook, FaCalendarAlt, FaQuestionCircle, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import Home from './Home';
import Schedule from './Schedule';
import QuestionSets from './QuestionSets';
import Settings from './Settings';
import { useAuth } from '../context/AuthContext';
import './MainApp.css';

function MainApp() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="main-app">
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">📚</span>
            {sidebarOpen && <span className="brand-text">Study Note Hub</span>}
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/app/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaBook />
            {sidebarOpen && <span>Trang chủ</span>}
          </NavLink>
          <NavLink to="/app/schedule" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaCalendarAlt />
            {sidebarOpen && <span>Lịch học</span>}
          </NavLink>
          <NavLink to="/app/questions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaQuestionCircle />
            {sidebarOpen && <span>Ôn tập</span>}
          </NavLink>
          <NavLink to="/app/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaCog />
            {sidebarOpen && <span>Cài đặt</span>}
          </NavLink>
          <button className="sidebar-link logout" onClick={handleLogout}>
            <FaSignOutAlt />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </nav>
      </div>

      <div className={`main-content ${sidebarOpen ? 'with-sidebar' : 'full'}`}>
        <header className="app-header">
          <div className="header-content">
            <h1>Study Note Hub</h1>
            <p>Ghi chú học tập thông minh</p>
          </div>
        </header>
        
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/questions" element={<QuestionSets />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default MainApp;