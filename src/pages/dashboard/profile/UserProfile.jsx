import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import profileService from '../../../services/profile.service';
import paymentService from '../../../services/payment.service';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import { validateForm, ruleRequired, ruleEmail, ruleMinLength, ruleMatch, rulePassword } from '../../../utils/validation';
import { 
  User, Lock, Save, Camera, CheckCircle, AlertCircle, 
  CreditCard, Zap, Crown, CheckCircle2, Clock, XCircle, ArrowRight 
} from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 3000);
  };

  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();
      if (data) {
        setProfileData({
          fullName: data.fullName || '',
          email: data.email || '',
          avatarUrl: data.avatarUrl || ''
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const data = await paymentService.getMyPayments();
      setPayments(data || []);
    } catch (err) {
      console.error('Failed to load payment history', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchPayments();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || '',
        avatarUrl: prev.avatarUrl || user.avatarUrl || ''
      }));
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(profileData, {
      fullName: [ruleRequired('Họ và tên không được để trống')],
      email: [ruleRequired('Email không được để trống'), ruleEmail('Email không hợp lệ')]
    });
    
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSavingProfile(true);
    try {
      const updatedProfile = await profileService.updateProfile({
        fullName: profileData.fullName,
        email: profileData.email,
        avatarUrl: profileData.avatarUrl
      });
      
      showToast('Cập nhật hồ sơ thành công!', 'success');
      
      // Update global auth context user state if needed
      if (setUser && updatedProfile) {
        setUser({ ...user, ...updatedProfile });
      }
    } catch (err) {
      setProfileErrors({ form: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrorMessage('');
    
    const errors = validateForm(passwordData, {
      currentPassword: [ruleRequired()],
      newPassword: [ruleRequired(), rulePassword()],
      confirmPassword: [ruleRequired(), ruleMatch('newPassword')]
    });
    
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSavingPassword(true);
    try {
      const message = await profileService.changePassword(passwordData);
      showToast(message || 'Đổi mật khẩu thành công!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordErrorMessage(err.response?.data?.message || 'Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="badge" style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-600)', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
            <CheckCircle2 size={12} /> Thành công
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="badge" style={{ backgroundColor: 'var(--danger-50)', color: 'var(--danger-600)', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
            <XCircle size={12} /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="badge" style={{ backgroundColor: 'var(--warning-50)', color: 'var(--warning-600)', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
            <Clock size={12} /> Chờ thanh toán
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-header">
        <h1>Hồ sơ của tôi</h1>
        <p>Quản lý thông tin cá nhân, bảo mật và các giao dịch gói cước</p>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} /> Thông tin cá nhân
        </button>
        <button 
          className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <Lock size={18} /> Đổi mật khẩu
        </button>
        <button 
          className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <CreditCard size={18} /> Gói dịch vụ & Giao dịch
        </button>
      </div>

      <div className="profile-content-container">
        {activeTab === 'profile' && (
          <section className="profile-section single-column">
            <h2><User size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> Thông tin cá nhân</h2>
            
            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <div className="avatar-preview">
                {profileData.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt="Avatar" className="avatar-image" />
                ) : (
                  <div className="avatar-image">
                    {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <Input 
                    label="URL Ảnh đại diện"
                    placeholder="https://example.com/avatar.jpg"
                    value={profileData.avatarUrl}
                    onChange={(e) => setProfileData({...profileData, avatarUrl: e.target.value})}
                  />
                </div>
              </div>

              <Input 
                label="Họ và tên"
                value={profileData.fullName}
                onChange={(e) => {
                  setProfileData({...profileData, fullName: e.target.value});
                  if(profileErrors.fullName) setProfileErrors({...profileErrors, fullName: null});
                }}
                error={profileErrors.fullName}
              />

              <Input 
                label="Địa chỉ Email"
                value={profileData.email}
                disabled={true}
                error={profileErrors.email}
                style={{ backgroundColor: 'var(--neutral-100)', color: 'var(--neutral-600)' }}
              />
              <small style={{ color: 'var(--neutral-500)', marginTop: '-8px' }}>Email hiện tại không thể thay đổi.</small>

              {profileErrors.form && <div style={{ color: 'var(--error-600)', fontSize: '14px' }}>{profileErrors.form}</div>}

              <div className="form-actions">
                <Button type="submit" isLoading={isSavingProfile} icon={<Save size={16} />}>
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'password' && (
          <section className="profile-section single-column">
            <h2><Lock size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> Đổi mật khẩu</h2>
            
            <form className="profile-form" onSubmit={handlePasswordSubmit}>
              <Input 
                label="Mật khẩu hiện tại"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => {
                  setPasswordData({...passwordData, currentPassword: e.target.value});
                  if(passwordErrors.currentPassword) setPasswordErrors({...passwordErrors, currentPassword: null});
                  setPasswordErrorMessage('');
                }}
                error={passwordErrors.currentPassword}
              />

              <Input 
                label="Mật khẩu mới"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData({...passwordData, newPassword: e.target.value});
                  if(passwordErrors.newPassword) setPasswordErrors({...passwordErrors, newPassword: null});
                }}
                error={passwordErrors.newPassword}
              />

              <Input 
                label="Xác nhận mật khẩu mới"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  setPasswordData({...passwordData, confirmPassword: e.target.value});
                  if(passwordErrors.confirmPassword) setPasswordErrors({...passwordErrors, confirmPassword: null});
                }}
                error={passwordErrors.confirmPassword}
              />

              {passwordErrorMessage && <div style={{ color: 'var(--error-600)', fontSize: '14px' }}>{passwordErrorMessage}</div>}

              <div className="form-actions">
                <Button type="submit" variant="outline" isLoading={isSavingPassword}>
                  Đổi mật khẩu
                </Button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'billing' && (
          <div className="billing-tab-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section className="profile-section">
              <h2><CreditCard size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> Gói dịch vụ hiện tại</h2>
              
              <div className="current-plan-card" style={{
                background: 'var(--neutral-50)',
                border: '1px solid var(--neutral-200)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="plan-icon-wrapper" style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: user?.subscriptionTier === 'PREMIUM' ? 'var(--danger-50)' : (user?.subscriptionTier === 'PRO' ? '#fef9c3' : 'var(--primary-50)'),
                    color: user?.subscriptionTier === 'PREMIUM' ? 'var(--danger-500)' : (user?.subscriptionTier === 'PRO' ? '#ca8a04' : 'var(--primary-500)')
                  }}>
                    {user?.subscriptionTier === 'PREMIUM' ? <Crown size={24} /> : (user?.subscriptionTier === 'PRO' ? <Zap size={24} /> : <User size={24} />)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                      {user?.subscriptionTier === 'PREMIUM' ? 'Gói Chuyên gia (Premium)' : (user?.subscriptionTier === 'PRO' ? 'Gói Nâng cao (Pro)' : 'Gói Cơ bản (Free)')}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--neutral-500)' }}>
                      {user?.subscriptionTier === 'PREMIUM' ? 'Lưu trữ không giới hạn & phân tích AI cao cấp' : (user?.subscriptionTier === 'PRO' ? 'Hỗ trợ lưu trữ tối đa 500 tài liệu & chat AI' : 'Gói mặc định của sinh viên')}
                    </p>
                  </div>
                </div>
                
                {user?.subscriptionTier !== 'PREMIUM' && (
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/dashboard/payment')}
                    icon={<ArrowRight size={16} />}
                  >
                    Nâng cấp ngay
                  </Button>
                )}
              </div>
            </section>

            <section className="profile-section">
              <h2>Lịch sử Giao dịch</h2>
              <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                <table className="modern-table" style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--neutral-200)', textAlign: 'left', color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
                      <th style={{ padding: '1rem', fontWeight: 600 }}>Mã Đơn Hàng</th>
                      <th style={{ padding: '1rem', fontWeight: 600 }}>Ngày Tạo</th>
                      <th style={{ padding: '1rem', fontWeight: 600 }}>Nội dung</th>
                      <th style={{ padding: '1rem', fontWeight: 600 }}>Số Tiền</th>
                      <th style={{ padding: '1rem', fontWeight: 600 }}>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPayments ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-neutral-400">Đang tải lịch sử giao dịch...</td>
                      </tr>
                    ) : payments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-neutral-400">Bạn chưa thực hiện giao dịch nào.</td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment.id} style={{ borderBottom: '1px solid var(--neutral-100)', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '1rem' }} className="font-medium text-neutral-800">
                            {payment.orderCode}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--neutral-600)' }}>
                            {formatDate(payment.createdAt)}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--neutral-700)' }}>
                            {payment.description}
                          </td>
                          <td style={{ padding: '1rem' }} className="font-bold text-primary-600">
                            {payment.amount?.toLocaleString()} đ
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {getStatusBadge(payment.status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>

      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
