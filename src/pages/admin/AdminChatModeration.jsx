import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Search, AlertCircle } from 'lucide-react';
import adminService from '../../services/admin.service';
import Button from '../../components/Button/Button';
import ConfirmDeleteModal from '../../components/Modal/ConfirmDeleteModal';
import Modal from '../../components/Modal/Modal';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminChatModeration = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteChatId, setDeleteChatId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewSessionId, setViewSessionId] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  //test deploy

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllChatSessions();
      setSessions(data?.data || []);
    } catch (err) {
      setError('Lỗi khi tải danh sách chat sessions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const confirmDelete = async () => {
    if (!deleteChatId) return;
    setIsProcessing(true);
    try {
      await adminService.deleteChatSession(deleteChatId);
      setDeleteChatId(null);
      fetchSessions();
    } catch (err) {
      alert('Lỗi xóa phiên chat: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const viewMessages = async (sessionId) => {
    setViewSessionId(sessionId);
    setLoadingMessages(true);
    setSessionMessages([]);
    try {
      const messages = await adminService.getSessionMessages(sessionId);
      setSessionMessages(messages || []);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải tin nhắn');
    } finally {
      setLoadingMessages(false);
    }
  };

  return (
    <div className="premium-page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Kiểm duyệt Chat AI</h1>
        <p className="page-description">Quản lý và theo dõi các phiên trò chuyện của người dùng trên toàn hệ thống.</p>
      </div>

      <div className="dashboard-section glass-card" style={{ padding: '1.5rem' }}>
        {error && (
          <div style={{ backgroundColor: 'var(--error-50)', color: 'var(--error-600)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral-500)' }}>Đang tải danh sách phiên chat...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--neutral-200)', color: 'var(--neutral-600)' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>ID Phiên chat</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Người dùng</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Liên kết tài liệu</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Thời gian tạo</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
                      Không có phiên chat nào hoặc API chưa được hỗ trợ.
                    </td>
                  </tr>
                ) : (
                  sessions.map(session => (
                    <tr key={session.sessionId} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <MessageSquare size={20} color="var(--primary-500)" />
                        <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={session.sessionId}>
                          {session.sessionId}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-600)' }}>
                        <div>{session.userFullName || 'User'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--neutral-500)' }}>{session.userEmail}</div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-600)' }}>
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '12px', fontWeight: 600, backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                          {session.title || 'Chat tự do'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-600)' }}>
                        {session.createdAt ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: vi }) : '-'}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            title="Xem nội dung chat"
                            onClick={() => viewMessages(session.sessionId)}
                            style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)' }}
                          >
                            <Search size={16} />
                          </button>
                          <button
                            title="Xóa phiên chat"
                            onClick={() => setDeleteChatId(session.sessionId)}
                            style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--error-50)', color: 'var(--error-600)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={!!deleteChatId}
        onClose={() => setDeleteChatId(null)}
        onConfirm={confirmDelete}
        isDeleting={isProcessing}
        title="Xóa Phiên Trò chuyện"
        message="Cảnh báo: Bạn có chắc chắn muốn xóa phiên trò chuyện này? Toàn bộ lịch sử nhắn tin của người dùng sẽ bị xóa vĩnh viễn khỏi hệ thống."
      />

      <Modal
        isOpen={!!viewSessionId}
        onClose={() => setViewSessionId(null)}
        title="Nội dung phiên chat"
        footer={<Button onClick={() => setViewSessionId(null)}>Đóng</Button>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '50vh', overflowY: 'auto', padding: '0.5rem' }}>
          {loadingMessages ? (
            <div style={{ textAlign: 'center', color: 'var(--neutral-500)', padding: '2rem' }}>Đang tải tin nhắn...</div>
          ) : sessionMessages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--neutral-500)', padding: '2rem' }}>Không có tin nhắn nào.</div>
          ) : (
            sessionMessages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: (msg.role || '').toUpperCase() === 'USER' ? 'flex-end' : 'flex-start',
                backgroundColor: (msg.role || '').toUpperCase() === 'USER' ? 'var(--primary-50)' : 'var(--neutral-50)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                maxWidth: '85%',
                border: (msg.role || '').toUpperCase() === 'USER' ? '1px solid var(--primary-100)' : '1px solid var(--neutral-200)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.25rem', fontWeight: 600 }}>
                  {(msg.role || '').toUpperCase() === 'USER' ? 'Người dùng' : 'AI Assistant'}
                </div>
                <div style={{ color: 'var(--neutral-800)', whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AdminChatModeration;
