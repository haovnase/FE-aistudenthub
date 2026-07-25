import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Search, 
  MessageSquare, 
  Upload, 
  FileText, 
  LogOut,
  Settings,
  Shield,
  Bell,
  Menu,
  Folder,
  BarChart,
  Users,
  Terminal,
  CreditCard,
  Crown
} from 'lucide-react';
import Button from '../components/Button/Button';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const role = user?.role?.replace('ROLE_', '') || 'USER';
  const isAdmin = role === 'ADMIN';

  const userNavigation = [
    { name: 'Trang chủ', to: '/dashboard', icon: <BookOpen size={20} /> },
    { name: 'Tài liệu của tôi', to: '/dashboard/my', icon: <Search size={20} /> },
    { name: 'Trò chuyện AI', to: '/dashboard/chat', icon: <MessageSquare size={20} /> },
    { name: 'Thư mục của tôi', to: '/dashboard/folders', icon: <Folder size={20} /> },
    { name: 'Tải lên Tài liệu', to: '/dashboard/upload', icon: <Upload size={20} /> },
    { name: 'Nạp tiền / Gói cước', to: '/dashboard/payment', icon: <CreditCard size={20} /> },
    { name: 'Hồ sơ của tôi', to: '/dashboard/profile', icon: <Settings size={20} /> },
  ];

  const adminNavigation = [
    { name: 'Dashboard', to: '/admin', icon: <BarChart size={20} /> },
    { name: 'Quản lý Người dùng', to: '/admin/users', icon: <Users size={20} /> },
    { name: 'Quản lý Tài liệu', to: '/admin/documents', icon: <FileText size={20} /> },
    { name: 'Quản lý Chat', to: '/admin/chats', icon: <MessageSquare size={20} /> },
    { name: 'Cài đặt Hệ thống', to: '/admin/settings', icon: <Shield size={20} /> },
    { name: 'Nhật ký Hệ thống', to: '/admin/logs', icon: <Terminal size={20} /> },
  ];

  const navigation = isAdmin ? adminNavigation : userNavigation;

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <BookOpen size={28} className="sidebar-logo-icon" />
          <span className="sidebar-logo-text">AI Student Hub</span>
        </div>
        
        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/dashboard' || item.to === '/admin'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span className="nav-item-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-btn">
            <div className="user-avatar" style={{ border: user?.isPremium ? '2px solid #eab308' : 'none' }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <span className="user-email" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {user?.email || 'user@example.com'}
                {user?.isPremium && <Crown size={14} color="#eab308" fill="#eab308" title="Tài khoản Premium" />}
              </span>
              <span className="user-role">{role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} title="Đăng xuất">
            <LogOut size={18} />
            <span className="nav-item-text">Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="header-icon-btn" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title="Toggle Menu"
            >
              <Menu size={20} />
            </button>
            <div className="header-search">
              <Search size={18} color="var(--neutral-400)" />
              <input type="text" placeholder="Tìm kiếm nhanh trong hub..." />
            </div>
          </div>
          <div className="header-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--neutral-700)' }}>
               {user?.fullName || user?.email?.split('@')[0] || 'User'}
               {user?.isPremium && <Crown size={16} color="#eab308" fill="#eab308" style={{ marginLeft: '2px' }} title="Tài khoản Premium" />}
            </div>
          </div>
        </header>
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
