import api from './api';

const documentService = {
  upload: async (file, requestData) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const requestBlob = new Blob([JSON.stringify(requestData)], { type: 'application/json' });
    formData.append('request', requestBlob);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data;
  },

  search: async (params) => {
    const { keyword, subject, major, folderId, documentType, page = 0, size = 12 } = params || {};
    
    const response = await api.get('/documents/my');
    let allDocs = response.data?.data || [];
    
    if (keyword) {
      const kw = keyword.toLowerCase();
      allDocs = allDocs.filter(d => 
        (d.title?.toLowerCase().includes(kw)) || 
        (d.description?.toLowerCase().includes(kw))
      );
    }
    if (subject) {
      allDocs = allDocs.filter(d => d.subject === subject);
    }
    if (major) {
      allDocs = allDocs.filter(d => d.major === major);
    }
    if (folderId) {
      allDocs = allDocs.filter(d => d.folderId === folderId);
    }
    if (documentType) {
      allDocs = allDocs.filter(d => d.documentType === documentType);
    }
    
    const totalElements = allDocs.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const pagedDocs = allDocs.slice(start, start + size);
    
    return {
      content: pagedDocs,
      totalElements,
      totalPages,
      number: page,
      size
    };
  },

  getMyDocuments: async () => {
    const response = await api.get('/documents/my');
    return response.data?.data;
  },

  getPublicDocuments: async (params) => {
    const { keyword, subject, major, page = 0, size = 6 } = params || {};
    const response = await api.get('/documents/public', {
      params: { keyword, subject, major, page, size }
    });
    return response.data?.data;
  },

  getOnlyOfficeConfig: async (id) => {
    const response = await api.get(`/documents/${id}/onlyoffice-config`);
    return response.data?.data;
  },

  getFilterOptions: async () => {
    const response = await api.get('/documents/filter-options');
    return response.data?.data;
  },

  getById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data?.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  getUploadStatus: async (id) => {
    const response = await api.get(`/documents/${id}/upload-status`);
    return response.data?.data;
  },

  getPreview: async (id) => {
    const response = await api.get(`/documents/${id}/preview`);
    return response.data?.data;
  },

  getDownloadUrl: async (id) => {
    const response = await api.get(`/documents/${id}/download`);
    return response.data?.data;
  },

  stream: async (id) => {
    const response = await api.get(`/documents/${id}/stream`, { responseType: 'blob' });
    return response.data;
  }
};

export default documentService;
