import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaMoon, FaSun, FaKey, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Settings.css';

function Settings() {
  const { user, changePassword } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
    toast.success(`Đã chuyển sang chế độ ${newTheme === 'light' ? 'sáng' : 'tối'}`);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    const result = await changePassword(passwordData.oldPassword, passwordData.newPassword);
    if (result.success) {
      toast.success('Đổi mật khẩu thành công');
      setShowPasswordForm(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(result.error || 'Đổi mật khẩu thất bại');
    }
  };

  return (
    <div className="settings-container">
      <h2>⚙️ Cài đặt</h2>

      <div className="settings-section">
        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-left">
              <FaUser className="settings-icon" />
              <div>
                <h4>Thông tin tài khoản</h4>
                <p className="settings-detail">Tên đăng nhập: {user?.username}</p>
                <p className="settings-detail">Email: {user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-left">
              <FaKey className="settings-icon" />
              <div>
                <h4>Đổi mật khẩu</h4>
                <p className="settings-detail">Cập nhật mật khẩu mới cho tài khoản</p>
              </div>
            </div>
            <button className="settings-action-btn" onClick={() => setShowPasswordForm(!showPasswordForm)}>
              {showPasswordForm ? 'Đóng' : 'Thay đổi'}
            </button>
          </div>

          {showPasswordForm && (
            <form className="password-form" onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="save-password-btn">Lưu mật khẩu</button>
            </form>
          )}
        </div>

        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-left">
              {theme === 'light' ? <FaSun className="settings-icon" /> : <FaMoon className="settings-icon" />}
              <div>
                <h4>Giao diện</h4>
                <p className="settings-detail">
                  {theme === 'light' ? 'Chế độ sáng' : 'Chế độ tối'}
                </p>
              </div>
            </div>
            <button className="settings-action-btn" onClick={toggleTheme}>
              {theme === 'light' ? 'Chuyển sang tối' : 'Chuyển sang sáng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;