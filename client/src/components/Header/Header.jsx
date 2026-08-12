import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { FiMenu, FiUser, FiLogOut } from 'react-icons/fi';

import NotificationBell from '../Notifications/NotificationBell.jsx';
import './Header.css';

/**
 * Enterprise Fixed Welcome Header Component
 * Features top-left hamburger menu, dark/light theme toggle, notifications, profile & logout.
 */
const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userName = user?.name || user?.email || 'Team Member';
  const userRole = user?.role || 'Employee';
  const userInitials = userName
    ? userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : 'HR';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <header className="app-fixed-header">
      <div className="header-left">
        <button
          type="button"
          className="header-hamburger-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
          title="Toggle Navigation Menu"
        >
          <FiMenu size={22} />
        </button>

        <div className="header-user-group">
          <div className="header-user-avatar">{userInitials}</div>
          <div className="header-title-box">
            <h1 className="header-welcome-title">Welcome back, {userName}!</h1>
            <span className="header-role-badge">Role: {userRole}</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <NotificationBell />

        {/* Profile Icon Button */}
        <button
          type="button"
          className="header-icon-btn header-profile-btn"
          onClick={handleProfile}
          aria-label="Go to Profile"
          title="Profile"
        >
          <FiUser size={19} />
          <span className="header-btn-label">Profile</span>
        </button>

        {/* Logout Icon Button */}
        <button
          type="button"
          className="header-icon-btn header-logout-btn"
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
        >
          <FiLogOut size={19} />
          <span className="header-btn-label">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
