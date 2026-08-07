import React from 'react';
import { FaUserCircle, FaEnvelope, FaUser, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

function Profile() {
  const { user } = useAuth();

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-avatar-large">
          <FaUserCircle />
        </div>
        <h2>{user?.username || 'Người dùng'}</h2>
        <p className="profile-role">Học sinh / Sinh viên</p>

        <div className="profile-info-list">
          <div className="info-item">
            <FaUser className="info-icon" />
            <div>
              <span className="info-label">Tên đăng nhập</span>
              <p className="info-value">{user?.username || 'N/A'}</p>
            </div>
          </div>

          <div className="info-item">
            <FaEnvelope className="info-icon" />
            <div>
              <span className="info-label">Địa chỉ Email</span>
              <p className="info-value">{user?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="info-item">
            <FaShieldAlt className="info-icon" />
            <div>
              <span className="info-label">Trạng thái tài khoản</span>
              <p className="info-value status-active">Đã xác thực</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;