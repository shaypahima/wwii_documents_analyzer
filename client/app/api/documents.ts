import { api } from '../lib/api';
import type { ApiResponse, Document, DocumentStats, SearchResult, Entity, AnalysisResult } from '../lib/types';

export interface DocumentFilters {
  page?: number;
  limit?: number;
  documentType?: string;
  sortBy?: string;
  keyword?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
}

// Backend response structure for documents
interface DocumentsBackendResponse {
  documents: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Backend response structure for search
interface SearchBackendResponse {
  data: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const documentsApi = {
  // Get all documents with filters and pagination
  async getDocuments(filters: DocumentFilters = {}): Promise<SearchResult> {
    console.log('getDocuments', filters); 
    const response = await api.get<ApiResponse<DocumentsBackendResponse>>('/documents', { params: filters });
    console.log('getDocuments response', response.data);
    
    const backendData = response.data.data || response.data;
    
    // Convert backend response to SearchResult format
    return {
      documents: backendData.documents || [],
      total: backendData.pagination?.total || 0,
      page: backendData.pagination?.page || 1,
      limit: backendData.pagination?.limit || 10
    };
  },

  // Get document by ID
  async getDocument(id: string): Promise<Document> {
    console.log('getDocument', id); 
    const response = await api.get<ApiResponse<Document>>(`/documents/${id}`);
    console.log('getDocument response', response.data);
    return response.data.data;
  },

  // Search documents
  async searchDocuments(query: string, page = 1, limit = 20): Promise<SearchResult> {
    console.log('searchDocuments', query, page, limit); 
    const params = { q: query, page, limit };
    const response = await api.get<ApiResponse<SearchBackendResponse>>('/documents/search', { params });
    console.log('searchDocuments response', response.data);
    
    const backendData = response.data.data || response.data;
    
    // Convert backend response to SearchResult format
    return {
      documents: backendData.data || [],
      total: backendData.pagination?.total || 0,
      page: backendData.pagination?.page || page,
      limit: backendData.pagination?.limit || limit
    };
  },

  // Get document statistics
  async getDocumentStats(): Promise<DocumentStats> {
    console.log('getDocumentStats'); 
    const response = await api.get<ApiResponse<DocumentStats>>('/documents/stats');
    console.log('getDocumentStats response', response.data);
    return response.data.data;
  },

  // Get documents by entity
  async getDocumentsByEntity(entityId: string, page = 1, limit = 20): Promise<SearchResult> {
    console.log('getDocumentsByEntity', entityId, page, limit); 
    const params = { page, limit };
    
    // Backend returns: { success: true, data: [documents], pagination: {...} }
    interface EntityDocumentsResponse {
      success: boolean;
      data: Document[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      timestamp: string;
    }
    
    const response = await api.get<EntityDocumentsResponse>(`/documents/entity/${entityId}`, { params });
    console.log('getDocumentsByEntity response', response.data);
    console.log('getDocumentsByEntity documents count:', response.data.data?.length);
    console.log('getDocumentsByEntity total:', response.data.pagination?.total);
    
    // Convert backend response to SearchResult format
    return {
      documents: response.data.data || [],
      total: response.data.pagination?.total || 0,
      page: response.data.pagination?.page || page,
      limit: response.data.pagination?.limit || limit
    };
  },

  // Analyze document from Google Drive (without saving)
  async analyzeDocument(fileId: string): Promise<AnalysisResult> {
    console.log('analyzeDocument', fileId); 
    const response = await api.post<ApiResponse<AnalysisResult>>(`/documents/analyze/${fileId}`);
    console.log('analyzeDocument response', response.data);
    return response.data.data;
  },

  // Process and save document from Google Drive
  async processAndSaveDocument(fileId: string): Promise<Document> {
    console.log('processAndSaveDocument', fileId); 
    const response = await api.post<ApiResponse<Document>>(`/documents/process/${fileId}`);
    console.log('processAndSaveDocument response', response.data);
    return response.data.data;
  },

  // Update document
  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    console.log('updateDocument', id, data); 
    const response = await api.put<ApiResponse<Document>>(`/documents/${id}`, data);
    console.log('updateDocument response', response.data);
    return response.data.data;
  },

  // Delete document
    async deleteDocument(id: string): Promise<void> {
    console.log('deleteDocument', id); 
    await api.delete(`/documents/${id}`);
  },
}; 