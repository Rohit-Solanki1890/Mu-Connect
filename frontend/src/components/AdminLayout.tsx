import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentTab, onTabChange }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'pending', label: 'Pending', icon: '⏳' },
    { id: 'reports', label: 'Reports', icon: '🚩' },
    { id: 'rooms', label: 'Rooms', icon: '🏛️' },
    { id: 'permissions', label: 'Permissions', icon: '🔐' },
    { id: 'secret-chat', label: 'Secret Chat', icon: '🔮' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-kingdom-container">
      {/* Animated Background Stars */}
      <div className="admin-background-stars"></div>

      <div className="admin-kingdom-content">
        {/* ROYAL HEADER */}
        <div className="admin-header">
          <div className="admin-header-title">
            <span>Kingdom of Admin</span>
          </div>
          <div className="admin-status">
            <div className="admin-status-badge">
              🟢 Active Kingdom
            </div>
            <span>{user?.name}</span>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="admin-button admin-button-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              ☰
            </button>
            <button
              onClick={handleLogout}
              className="admin-button admin-button-danger"
              style={{ padding: '0.5rem 1rem' }}
            >
              Logout
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', height: 'calc(100vh - 140px)' }}>
          {/* ROYAL SIDEBAR */}
          <div
            className="admin-sidebar"
            style={{
              display: sidebarOpen ? 'block' : 'none',
              width: sidebarOpen ? '280px' : '0',
            }}
          >
            <div style={{ padding: '1rem' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(232, 232, 232, 0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '1rem',
                  paddingLeft: '1.5rem',
                  fontWeight: 700,
                }}
              >
                Navigation
              </div>
              {adminTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`admin-nav-item ${currentTab === tab.id ? 'active' : ''}`}
                >
                  <span className="admin-nav-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="admin-main">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
