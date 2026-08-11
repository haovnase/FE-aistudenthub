import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, FileText, Download, Eye, Globe, FileCode2, FileSpreadsheet, FileIcon } from 'lucide-react';
import documentService from '../../../services/document.service';
import Button from '../../../components/Button/Button';
import './DocumentSearch.css';

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

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const CommunityDocuments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState([]);
  
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    subject: searchParams.get('subject') || '',
    major: searchParams.get('major') || '',
    page: 0,
    size: 12
  });

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ subjects: [], majors: [] });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    const keyword = searchParams.get('keyword') || '';
    const subject = searchParams.get('subject') || '';
    const major = searchParams.get('major') || '';
    setFilters(prev => {
      if (prev.keyword === keyword && prev.subject === subject && prev.major === major) {
        return prev;
      }
      return { ...prev, keyword, subject, major, page: 0 };
    });
  }, [searchParams]);

  useEffect(() => {
    fetchDocuments();
  }, [filters.page, searchParams]); // re-fetch when page changes or search params change

  const loadFilterOptions = async () => {
    try {
      const options = await documentService.getFilterOptions();
      if (options) {
        setFilterOptions({
          subjects: options.publicSubjects || [],
          majors: options.publicMajors || []
        });
      }
    } catch (error) {
      console.error('Failed to load filter options');
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = {
        keyword: filters.keyword,
        subject: filters.subject,
        major: filters.major,
        page: filters.page,
        size: filters.size
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const data = await documentService.getPublicDocuments(params);
      if (data) {
        setDocuments(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      }
    } catch (error) {
      console.error('Failed to search documents', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (filters.keyword) newParams.keyword = filters.keyword;
    if (filters.subject) newParams.subject = filters.subject;
    if (filters.major) newParams.major = filters.major;
    setSearchParams(newParams);
    setFilters(prev => ({ ...prev, page: 0 }));
  };

  const handleDownload = async (docId, fileName, e) => {
    e.stopPropagation();
    try {
      const url = await documentService.getDownloadUrl(docId);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Failed to get download URL', err);
      alert('Tải xuống thất bại');
    }
  };

  const handlePreview = (docId, e) => {
    e.stopPropagation();
    navigate(`/dashboard/documents/${docId}`);
  };

  const isSearching = filters.keyword || filters.subject || filters.major;

  return (
    <div className="premium-page-wrapper document-search-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={28} color="var(--primary-600)" /> Tài liệu Cộng đồng
          </h1>
          <p className="page-description">Khám phá và học hỏi từ hàng ngàn tài liệu được chia sẻ bởi sinh viên khác.</p>
        </div>
      </div>

      <div className="search-header-card">
        <form onSubmit={handleSearchSubmit} className="search-bar-wrapper" style={{ marginBottom: 0 }}>
          <div className="search-input-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm theo tiêu đề hoặc từ khóa..."
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
            />
          </div>
          
          <select
            className="filter-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={filters.major}
            onChange={(e) => setFilters(prev => ({ ...prev, major: e.target.value }))}
          >
            <option value="">Tất cả Chuyên ngành</option>
            {filterOptions.majors.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            className="filter-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={filters.subject}
            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
          >
            <option value="">Tất cả Môn học</option>
            {filterOptions.subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          
          <Button type="submit" style={{ padding: '0 32px' }}>Tìm kiếm</Button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--neutral-400)' }}>
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          <div className="documents-section">
            <div style={{ fontSize: '14px', color: 'var(--neutral-500)', fontWeight: 500, marginBottom: '16px' }}>
              Tìm thấy {totalElements} tài liệu công khai
            </div>

            {documents.length > 0 ? (
              <div className="documents-grid">
                {documents.map(doc => (
                  <div key={doc.id} className="document-card" onClick={(e) => handlePreview(doc.id, e)}>
                    <div className="document-card-header">
                      <div className={`doc-icon-wrapper ${getIconClass(doc.fileName)}`}>
                        {getFileIcon(doc.documentType, doc.fileName)}
                      </div>
                      <div className="doc-info">
                        <h3 className="doc-title" title={doc.title}>{doc.title}</h3>
                        <div className="doc-meta">
                          {doc.subject && <span className="doc-badge">{doc.subject}</span>}
                          <span>{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>

                    <p className="doc-description">
                      {doc.description || 'Không có mô tả cho tài liệu này.'}
                    </p>

                    <div className="doc-footer">
                      <span className="doc-size" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {formatFileSize(doc.fileSize)}
                        <span style={{ color: 'var(--primary-600)', backgroundColor: 'var(--primary-50)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                          {doc.ownerName || doc.authorName || doc.uploadedBy || doc.user?.fullName || 'Người dùng vô danh'}
                        </span>
                      </span>
                      <div className="doc-actions">
                        <button className="doc-btn" onClick={(e) => handlePreview(doc.id, e)}>
                          <Eye size={16} /> Xem
                        </button>
                        <button className="doc-btn" onClick={(e) => handleDownload(doc.id, doc.fileName, e)}>
                          <Download size={16} /> Lưu
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'var(--glass-bg)', borderRadius: 'var(--radius-xl)' }}>
                <Globe size={48} color="var(--neutral-300)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--neutral-700)' }}>Không tìm thấy tài liệu nào</h3>
                <p style={{ color: 'var(--neutral-500)' }}>{isSearching ? 'Hãy thử điều chỉnh tiêu chí tìm kiếm.' : 'Kho tài liệu cộng đồng hiện đang trống.'}</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination-controls">
                <Button
                  variant="outline"
                  disabled={filters.page === 0}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Trang trước
                </Button>
                <span className="pagination-text">Trang {filters.page + 1} trên {totalPages}</span>
                <Button
                  variant="outline"
                  disabled={filters.page === totalPages - 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Trang tiếp
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommunityDocuments;
