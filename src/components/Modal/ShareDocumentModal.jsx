import React, { useState, useEffect } from 'react';
import { X, Send, User, Shield, ShieldAlert, Loader2, UserMinus } from 'lucide-react';
import Button from '../Button/Button';
import documentService from '../../services/document.service';

const ShareDocumentModal = ({ isOpen, onClose, documentTitle, documentId }) => {
  const [email, setEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [sharedUsers, setSharedUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isRevoking, setIsRevoking] = useState(null);

  useEffect(() => {
    if (isOpen && documentId) {
      setEmail('');
      setError('');
      setSuccess('');
      fetchSharedUsers();
    }
  }, [isOpen, documentId]);

  const fetchSharedUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Backend may not have this implemented yet, handle gracefully
      const data = await documentService.getSharedUsers(documentId);
      setSharedUsers(data || []);
    } catch (err) {
      console.warn("Could not fetch shared users. API might not be implemented.");
      // Fallback empty data if API fails
      setSharedUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSharing(true);
    setError('');
    setSuccess('');

    try {
      await documentService.shareDocument(documentId, email.trim());
      setSuccess(`Đã chia sẻ thành công với ${email}`);
      setEmail('');
      fetchSharedUsers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể chia sẻ tài liệu. Có thể người dùng không tồn tại hoặc bạn đã chia sẻ trước đó.';
      setError(errorMessage);
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevoke = async (targetUserId) => {
    setIsRevoking(targetUserId);
    try {
      await documentService.revokeShare(documentId, targetUserId);
      setSuccess('Đã thu hồi quyền truy cập thành công.');
      fetchSharedUsers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi thu hồi quyền.';
      setError(errorMessage);
    } finally {
      setIsRevoking(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={24} color="var(--primary-500)" />
            Chia sẻ tài liệu
          </h2>
          <p className="modal-description" style={{ marginTop: '0.5rem' }}>
            Tài liệu: <strong>{documentTitle}</strong>
          </p>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} />
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} />
              {success}
            </div>
          )}

          <form onSubmit={handleShare} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
            <input
              type="email"
              className="form-control"
              placeholder="Nhập email người nhận..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSharing}
              style={{ flex: 1 }}
              required
            />
            <Button type="submit" variant="primary" disabled={isSharing || !email.trim()}>
              {isSharing ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
              <span style={{ marginLeft: '8px' }}>Gửi</span>
            </Button>
          </form>

          <div className="shared-users-section">
            <h4 style={{ fontSize: '0.9rem', color: 'var(--neutral-500)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Những người có quyền truy cập
            </h4>
            
            {isLoadingUsers ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--neutral-400)' }}>
                <Loader2 size={24} className="spin" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Đang tải danh sách...</p>
              </div>
            ) : sharedUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'var(--neutral-50)', borderRadius: '8px', color: 'var(--neutral-500)', fontSize: '0.9rem' }}>
                Tài liệu này chưa được chia sẻ cho ai.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
                {sharedUsers.map((user) => (
                  <li key={user.sharedWithUserId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--neutral-50)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-600)', fontWeight: 'bold' }}>
                        {user.targetEmail ? user.targetEmail.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{user.targetEmail || 'Người dùng hệ thống'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>Quyền: Người xem (Read)</div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => handleRevoke(user.sharedWithUserId)}
                      disabled={isRevoking === user.sharedWithUserId}
                      style={{ padding: '6px 10px', color: 'var(--danger-500)', borderColor: 'var(--danger-200)' }}
                      title="Thu hồi quyền"
                    >
                      {isRevoking === user.sharedWithUserId ? <Loader2 size={16} className="spin" /> : <UserMinus size={16} />}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDocumentModal;
