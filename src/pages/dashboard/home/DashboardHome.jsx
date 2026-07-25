import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import documentService from '../../../services/document.service';
import folderService from '../../../services/folder.service';
import { 
  FileText, Folder, Image, FileOutput, 
  Upload, MessageSquare, Plus, Clock, FileWarning, Globe, User, Crown
} from 'lucide-react';
import './DashboardHome.css';

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalFolders: 0,
    pdfCount: 0,
    imageCount: 0,
    otherCount: 0
  });
  const [recentDocs, setRecentDocs] = useState([]);
  const [publicDocs, setPublicDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch documents, folders, and public documents
      const [docsResponse, foldersResponse, publicResponse] = await Promise.all([
        documentService.getMyDocuments(),
        folderService.getFolders(),
        documentService.getPublicDocuments({ page: 0, size: 6 }).catch(() => null)
      ]);

      const docs = docsResponse || [];
      const folders = foldersResponse || [];

      if (publicResponse && publicResponse.content) {
        setPublicDocs(publicResponse.content);
      }

      // Calculate stats
      let pdfs = 0;
      let images = 0;
      let others = 0;

      docs.forEach(doc => {
        const mimeType = (doc.fileType || '').toLowerCase();
        const extension = (doc.fileName || '').split('.').pop().toLowerCase();
        
        if (mimeType.includes('pdf') || extension === 'pdf') {
          pdfs++;
        } else if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
          images++;
        } else {
          others++;
        }
      });

      setStats({
        totalDocs: docs.length,
        totalFolders: folders.length,
        pdfCount: pdfs,
        imageCount: images,
        otherCount: others
      });

      // Get 5 most recent documents
      const sortedDocs = [...docs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentDocs(sortedDocs.slice(0, 5));

    } catch (err) {
      console.error('Lỗi khi tải dữ liệu dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDocIcon = (doc) => {
    const mimeType = (doc.fileType || '').toLowerCase();
    const extension = (doc.fileName || '').split('.').pop().toLowerCase();
    
    if (mimeType.includes('pdf') || extension === 'pdf') {
      return <FileText size={20} />;
    }
    if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
      return <Image size={20} />;
    }
    return <FileOutput size={20} />;
  };

  const getDocIconClass = (doc) => {
    const mimeType = (doc.fileType || '').toLowerCase();
    const extension = (doc.fileName || '').split('.').pop().toLowerCase();
    
    if (mimeType.includes('pdf') || extension === 'pdf') {
      return 'pdf';
    }
    if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
      return 'image';
    }
    return 'word';
  };

  return (
    <div className="dashboard-home-wrapper">
      <div className="welcome-section">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Chào mừng trở lại, {user?.fullName || 'bạn'}! 👋
          {user?.isPremium && <Crown size={26} color="#eab308" fill="#eab308" title="Tài khoản Premium" style={{ filter: 'drop-shadow(0 2px 4px rgba(234,179,8,0.2))' }} />}
        </h1>
        <p>Dưới đây là tổng quan về các hoạt động học tập gần đây và kho tài liệu công cộng.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{isLoading ? '...' : stats.totalDocs}</div>
            <div className="stat-label">Tổng số Tài liệu</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            <Folder size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{isLoading ? '...' : stats.totalFolders}</div>
            <div className="stat-label">Tổng số Thư mục</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <FileWarning size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{isLoading ? '...' : stats.pdfCount}</div>
            <div className="stat-label">Tài liệu PDF</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon danger">
            <Image size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{isLoading ? '...' : stats.imageCount}</div>
            <div className="stat-label">Hình ảnh</div>
          </div>
        </div>
      </div>

      {/* Public Documents Section */}
      <div className="dashboard-section glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="dashboard-section-header" style={{ marginBottom: '1.25rem' }}>
          <div className="dashboard-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600 }}>
            <Globe size={22} color="var(--primary-600)" /> Tài liệu Cộng đồng (Public)
          </div>
          <Link to="/dashboard/my" style={{ fontSize: '0.875rem', color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 500 }}>
            Khám phá thêm
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)', gridColumn: '1/-1' }}>Đang tải tài liệu public...</div>
          ) : publicDocs.length > 0 ? (
            publicDocs.map(doc => (
              <Link 
                to={`/dashboard/documents/${doc.id}`} 
                key={doc.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--neutral-200)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div className={`recent-doc-icon ${getDocIconClass(doc)}`} style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getDocIcon(doc)}
                    </div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--neutral-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '190px' }} title={doc.title}>
                      {doc.title}
                    </h4>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--neutral-500)' }}>
                    {doc.subject || 'Môn học khác'} • {doc.documentType}
                  </p>
                </div>

                <div style={{ paddingTop: '8px', borderTop: '1px solid var(--neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--primary-700)', fontWeight: 500, backgroundColor: 'var(--primary-50)', padding: '4px 8px', borderRadius: '6px' }}>
                    <User size={14} />
                    <span>{doc.ownerName || 'Sinh viên'}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--neutral-400)' }}>
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)', gridColumn: '1/-1' }}>
              Chưa có tài liệu công khai nào.
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <div className="dashboard-section-title">
              <Clock size={20} /> Tài liệu của tôi gần đây
            </div>
            <Link to="/dashboard/my" style={{ fontSize: '0.875rem', color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 500 }}>
              Xem tất cả
            </Link>
          </div>
          
          <div className="recent-docs-list">
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>Đang tải dữ liệu...</div>
            ) : recentDocs.length > 0 ? (
              recentDocs.map(doc => (
                <Link to={`/dashboard/documents/${doc.id}`} className="recent-doc-item" key={doc.id}>
                  <div className="recent-doc-main">
                    <div className={`recent-doc-icon ${getDocIconClass(doc)}`}>
                      {getDocIcon(doc)}
                    </div>
                    <div className="recent-doc-details">
                      <h4>{doc.title}</h4>
                      <p>{doc.subject || 'Không có môn học'} • {doc.documentType}</p>
                    </div>
                  </div>
                  <div className="recent-doc-meta">
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
                <FileOutput size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <p>Bạn chưa tải lên tài liệu nào.</p>
                <Link to="/dashboard/upload" style={{ color: 'var(--primary-600)', marginTop: '0.5rem', display: 'inline-block', textDecoration: 'none' }}>Tải lên ngay</Link>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <div className="dashboard-section-title">
              Truy cập nhanh
            </div>
          </div>
          <div className="dashboard-section-body">
            <div className="quick-actions-list">
              <Link to="/dashboard/upload" className="quick-action-btn">
                <div className="quick-action-icon">
                  <Upload size={20} />
                </div>
                <div className="quick-action-text">
                  <h4>Tải lên tài liệu</h4>
                  <p>Thêm tài liệu học tập mới</p>
                </div>
              </Link>
              
              <Link to="/dashboard/chat" className="quick-action-btn">
                <div className="quick-action-icon" style={{ background: 'var(--success-100)', color: 'var(--success-600)' }}>
                  <MessageSquare size={20} />
                </div>
                <div className="quick-action-text">
                  <h4>Hỏi đáp với AI</h4>
                  <p>Giải đáp thắc mắc ngay lập tức</p>
                </div>
              </Link>
              
              <Link to="/dashboard/my" className="quick-action-btn">
                <div className="quick-action-icon" style={{ background: 'var(--warning-100)', color: 'var(--warning-600)' }}>
                  <Plus size={20} />
                </div>
                <div className="quick-action-text">
                  <h4>Quản lý thư mục</h4>
                  <p>Sắp xếp tài liệu của bạn</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

