import React, { useState, useEffect } from 'react';
import { FileText, Search, Trash2, Eye, Download, AlertCircle, Activity, Globe, ListFilter } from 'lucide-react';
import adminService from '../../services/admin.service';
import Button from '../../components/Button/Button';
import ConfirmDeleteModal from '../../components/Modal/ConfirmDeleteModal';
import Modal from '../../components/Modal/Modal';
import AdminDocumentPreviewModal from './AdminDocumentPreviewModal';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminDocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PUBLIC' | 'REVIEW'
  
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewStatusDoc, setViewStatusDoc] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllDocuments(keyword, page, 20);
      setDocuments(data?.content || []);
    } catch (err) {
      setError('Lỗi khi tải danh sách tài liệu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchDocuments();
  };

  const confirmDelete = async (idToDelete) => {
    const docId = idToDelete || deleteDocId;
    if (!docId) return;
    setIsProcessing(true);
    try {
      await adminService.deleteDocument(docId);
      setDeleteDocId(null);
      setPreviewDoc(null);
      fetchDocuments();
    } catch (err) {
      alert('Lỗi xóa tài liệu: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewStatus = async (doc) => {
    setViewStatusDoc(doc);
    setLoadingStatus(true);
    try {
      const statusData = await adminService.getUploadStatus(doc.id);
      setUploadStatus(statusData);
    } catch (err) {
      console.error('Lỗi khi tải trạng thái upload:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'PUBLIC') {
      return doc.visibility === 'PUBLIC';
    }
    if (activeTab === 'REVIEW') {
      return doc.visibility === 'PUBLIC' || doc.processingStatus === 'PENDING';
    }
    return true;
  });

  const getFileIcon = (fileType) => {
    return <FileText size={20} color="var(--primary-500)" />;
  };

  return (
    <div className="premium-page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Quản lý & Kiểm duyệt Tài liệu</h1>
        <p className="page-description">Quản lý danh sách tài liệu Public từ người dùng và kiểm duyệt xem trước nội dung.</p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('ALL')} 
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: activeTab === 'ALL' ? 'var(--primary-600)' : '#ffffff',
            color: activeTab === 'ALL' ? '#ffffff' : 'var(--neutral-700)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <ListFilter size={18} /> Tất cả Tài liệu ({documents.length})
        </button>
        <button 
          onClick={() => setActiveTab('PUBLIC')} 
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: activeTab === 'PUBLIC' ? 'var(--primary-600)' : '#ffffff',
            color: activeTab === 'PUBLIC' ? '#ffffff' : 'var(--neutral-700)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Globe size={18} /> Tài liệu Public ({documents.filter(d => d.visibility === 'PUBLIC').length})
        </button>
      </div>

      <div className="dashboard-section glass-card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="header-search" style={{ flex: 1, backgroundColor: 'var(--neutral-50)', border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-md)' }}>
            <Search size={18} color="var(--neutral-400)" style={{ marginLeft: '1rem' }} />
            <input 
              type="text" 
              placeholder="Tìm kiếm tài liệu theo tên..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ padding: '0.75rem', width: '100%', border: 'none', backgroundColor: 'transparent', outline: 'none' }}
            />
          </div>
          <Button type="submit">Tìm kiếm</Button>
        </form>

        {error && (
          <div style={{ backgroundColor: 'var(--error-50)', color: 'var(--error-600)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral-500)' }}>Đang tải danh sách tài liệu...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--neutral-200)', color: 'var(--neutral-600)' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Tên tài liệu</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Người đăng</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Chế độ chia sẻ</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Môn học</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Thời gian</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>Không tìm thấy tài liệu nào.</td>
                  </tr>
                ) : (
                  filteredDocuments.map(doc => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {getFileIcon(doc.fileType)}
                        <span style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.title}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-600)' }}>{doc.ownerName || 'User'}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: doc.visibility === 'PUBLIC' ? 'var(--success-50, #ecfdf5)' : 'var(--neutral-100)',
                          color: doc.visibility === 'PUBLIC' ? 'var(--success-600, #059669)' : 'var(--neutral-600)'
                        }}>
                          {doc.visibility === 'PUBLIC' ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-600)' }}>{doc.subject || '-'}</td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-600)' }}>
                        {doc.createdAt ? formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true, locale: vi }) : '-'}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            title="Xem trước tài liệu (Admin Preview)"
                            onClick={() => setPreviewDoc(doc)}
                            style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            title="Xem trạng thái xử lý"
                            onClick={() => handleViewStatus(doc)}
                            style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--neutral-100)', color: 'var(--neutral-700)' }}
                          >
                            <Activity size={16} />
                          </button>
                          <button 
                            title="Xóa tài liệu"
                            onClick={() => setDeleteDocId(doc.id)}
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

      {/* Admin Document Preview Modal */}
      <AdminDocumentPreviewModal 
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        onDelete={(id) => confirmDelete(id)}
      />

      <ConfirmDeleteModal 
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={() => confirmDelete(deleteDocId)}
        isDeleting={isProcessing}
        title="Xóa Tài liệu Vi phạm"
        message="Cảnh báo: Bạn có chắc chắn muốn xóa vĩnh viễn tài liệu này khỏi hệ thống? Hành động này không thể hoàn tác."
      />

      <Modal 
        isOpen={!!viewStatusDoc}
        onClose={() => { setViewStatusDoc(null); setUploadStatus(null); }}
        title="Trạng thái Upload Tài liệu"
        footer={
          <Button variant="outline" onClick={() => { setViewStatusDoc(null); setUploadStatus(null); }}>Đóng</Button>
        }
      >
        {loadingStatus ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>Đang tải trạng thái...</div>
        ) : uploadStatus ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '12px', color: 'var(--neutral-500)', fontWeight: 500 }}>TÊN TÀI LIỆU</p>
              <p style={{ margin: 0, color: 'var(--neutral-800)', fontWeight: 500 }}>{viewStatusDoc?.title}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '12px', color: 'var(--neutral-500)', fontWeight: 500 }}>TRẠNG THÁI HIỆN TẠI</p>
              <p style={{ margin: 0, fontWeight: 500, color: uploadStatus.processingStatus === 'COMPLETED' ? 'var(--success-600)' : uploadStatus.processingStatus === 'FAILED' ? 'var(--error-600)' : 'var(--warning-600)' }}>
                {uploadStatus.processingStatus}
              </p>
            </div>
            {uploadStatus.errorMessage && (
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '12px', color: 'var(--neutral-500)', fontWeight: 500 }}>LỖI (NẾU CÓ)</p>
                <p style={{ margin: 0, color: 'var(--error-600)', fontWeight: 500, fontSize: '13px', backgroundColor: 'var(--error-50)', padding: '0.5rem', borderRadius: '4px' }}>
                  {uploadStatus.errorMessage}
                </p>
              </div>
            )}
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '12px', color: 'var(--neutral-500)', fontWeight: 500 }}>SỐ TRANG</p>
              <p style={{ margin: 0, color: 'var(--neutral-800)', fontWeight: 500 }}>{uploadStatus.totalPages || 0} trang</p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>Không có thông tin trạng thái.</div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDocumentList;

