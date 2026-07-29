import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import DashboardLayout from './layouts/DashboardLayout';
import {
  DashboardHome, 
  UserProfile,
  CommunityDocuments,
  AdminDashboardHome,
  AdminUserList,
  AdminDocumentList,
  AdminChatModeration,
  AdminSystemConfig,
  AdminSystemLogs,
  PaymentPackage,
  PaymentSuccess,
  PaymentCancel,
  PaymentHistory
} from './pages/dashboard/DashboardPages';
import UploadDocument from './pages/dashboard/documents/UploadDocument';
import DocumentSearch from './pages/dashboard/documents/DocumentSearch';
import DocumentDetail from './pages/dashboard/documents/DocumentDetail';
import AIChatbot from './pages/dashboard/chat/AIChatbot';
import Welcome from './pages/Welcome';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  const role = user?.role?.replace('ROLE_', '') || 'USER';
  if (requireAdmin && role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (!requireAdmin && role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  const role = user?.role?.replace('ROLE_', '') || 'USER';
  const isAdmin = role === 'ADMIN';

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<DashboardHome />} />
        <Route path="my" element={<DocumentSearch />} />
        <Route path="community" element={<CommunityDocuments />} />
        <Route path="folders" element={<Navigate to="/dashboard/my" replace />} />
        <Route path="chat" element={<AIChatbot />} />
        <Route path="upload" element={<UploadDocument />} />
        <Route path="documents/:id" element={<DocumentDetail />} />
        <Route path="profile" element={<UserProfile />} />
        
        <Route path="payment" element={<PaymentPackage />} />
        <Route path="payment/success" element={<PaymentSuccess />} />
        <Route path="payment/cancel" element={<PaymentCancel />} />
        <Route path="payment/history" element={<PaymentHistory />} />
      </Route>

      <Route 
        path="/admin" 
        element={<ProtectedRoute requireAdmin={true}><DashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<AdminDashboardHome />} />
        <Route path="users" element={<AdminUserList />} />
        <Route path="documents" element={<AdminDocumentList />} />
        <Route path="chats" element={<AdminChatModeration />} />
        <Route path="settings" element={<AdminSystemConfig />} />
        <Route path="logs" element={<AdminSystemLogs />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
