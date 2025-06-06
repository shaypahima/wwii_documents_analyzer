import { api } from '../lib/api';
import type { ApiResponse, FileListItem, FileMetadata, StorageInfo } from '../lib/types';

export interface StorageFilesResponse {
  files: FileListItem[];
  total?: number;
  page?: number;
  limit?: number;
}

export const storageApi = {
  // Get directory content from Google Drive
  async getFiles(folderId?: string, page: number = 1, limit: number = 20): Promise<StorageFilesResponse> {
    const params: any = { page, limit };
    if (folderId) params.folderId = folderId;
    
    const response = await api.get<ApiResponse<FileListItem[]>>('/storage/files', { params });
    
    if (!response.data.success) {
      throw new Error('Failed to fetch files from storage');
    }
    
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response.data.data)) {
      return {
        files: response.data.data,
        total: response.data.data.length,
        page,
        limit
      };
    } else {
      return response.data.data as StorageFilesResponse;
    }
  },

  // Get file metadata
  async getFileMetadata(fileId: string): Promise<FileMetadata> {
    const response = await api.get<ApiResponse<FileMetadata>>(`/storage/files/${fileId}`);
    
    if (!response.data.success) {
      throw new Error('Failed to fetch file metadata');
    }
    
    return response.data.data;
  },

  // Download file content
  async downloadFile(fileId: string): Promise<Blob> {
    const response = await api.get(`/storage/files/${fileId}/content`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Search files in Google Drive
  async searchFiles(query: string, folderId?: string, page: number = 1, limit: number = 20): Promise<StorageFilesResponse> {
    const params: any = { q: query, page, limit };
    if (folderId) params.folderId = folderId;
    
    const response = await api.get<ApiResponse<FileListItem[]>>('/storage/search', { params });
    
    if (!response.data.success) {
      throw new Error('Failed to search files in storage');
    }
    
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response.data.data)) {
      return {
        files: response.data.data,
        total: response.data.data.length,
        page,
        limit
      };
    } else {
      return response.data.data as StorageFilesResponse;
    }
  },

  // Get storage information
  async getStorageInfo(): Promise<StorageInfo> {
    const response = await api.get<ApiResponse<StorageInfo>>('/storage/info');
    return response.data.data;
  },

  // Test storage connection
  async testConnection(): Promise<{ connected: boolean; service: string; timestamp: string }> {
    const response = await api.get<ApiResponse<{ connected: boolean; service: string; timestamp: string }>>('/storage/health');
    return response.data.data;
  },
}; 