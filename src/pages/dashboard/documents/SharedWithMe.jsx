import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Search, Filter, Loader2, FileText, ArrowRight, FileCode2, FileSpreadsheet, FileIcon } from 'lucide-react';
import documentService from '../../../services/document.service';

const getFileIcon = (documentType, fileName = '') => {
  const name = fileName.toLowerCase();
  if (name.endsWith('.pdf')) return <FileText size={24} />;
  if (name.endsWith('.doc') || name.endsWith('.docx')) return <FileText size={24} />;
  if (name.endsWith('.ppt') || name.endsWith('.pptx')) return <FileSpreadsheet size={24} />;
  if (documentType === 'CODE') return <FileCode2 size={24} />;
  return <FileIcon size={24} />;
};

const getIconClass = (fileName = '') => {
  const name = fileName.toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'word';
  if (name.endsWith('.ppt') || name.endsWith('.pptx')) return 'ppt';
  return 'other';
};
import './SharedWithMe.css';

const SharedWithMe = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSharedDocuments();
  }, []);

  const fetchSharedDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getSharedWithMe();
      // Filter out nulls in case some documents were deleted
      setDocuments(data ? data.filter(doc => doc !== null) : []);
    } catch (err) {
      setError('Không thể tải danh sách tài liệu được chia sẻ.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="shared-with-me-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Share2 size={28} color="var(--primary-600)" />
          Được chia sẻ với tôi
        </h1>
        <p className="page-description">
          Danh sách các tài liệu học tập mà người khác đã chia sẻ cho bạn.
        </p>
      </div>

      <div className="filters-section glass-card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tài liệu được chia sẻ..." 
            className="form-control"
            style={{ paddingLeft: '38px', width: '100%', border: 'none', backgroundColor: 'var(--neutral-50)', borderRadius: '8px', outline: 'none' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--primary-600)' }}>
          <Loader2 size={40} className="spin" style={{ margin: '0 auto 1rem' }} />
          <p>Đang tải tài liệu...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" style={{ textAlign: 'center' }}>{error}</div>
      ) : documents.length === 0 ? (
        <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Share2 size={64} style={{ color: 'var(--neutral-300)', marginBottom: '1rem' }} />
          <h3>Chưa có tài liệu nào</h3>
          <p style={{ color: 'var(--neutral-500)', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
            Hiện tại chưa có ai chia sẻ tài liệu nào cho bạn. Các tài liệu được chia sẻ sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Search size={48} style={{ color: 'var(--neutral-300)', marginBottom: '1rem' }} />
          <h3>Không tìm thấy kết quả</h3>
          <p style={{ color: 'var(--neutral-500)' }}>Không có tài liệu nào phù hợp với từ khóa "{searchTerm}".</p>
        </div>
      ) : (
        <div className="documents-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {filteredDocs.map(doc => (
            <div key={doc.id} className="document-card" onClick={() => navigate(`/dashboard/documents/${doc.id}`)}>
              <div className="document-card-header">
                <div className={`doc-icon-wrapper ${getIconClass(doc.fileName)}`}>
                  {getFileIcon(doc.documentType, doc.fileName)}
                </div>
                <div className="doc-info">
                  <h3 className="doc-title" title={doc.title}>{doc.title}</h3>
                  <div className="doc-meta">
                    {doc.subject && <span className="doc-badge">{doc.subject}</span>}
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="doc-footer" style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--neutral-100)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Được chia sẻ bởi</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-700)' }}>
                    {doc.sharedBy || doc.ownerName || doc.authorName || doc.user?.fullName || 'Người dùng vô danh'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--neutral-500)' }}>
                    {doc.sharerEmail || doc.ownerEmail || doc.authorEmail || doc.user?.email || 'Không có email'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedWithMe;
