import { api } from '../lib/api';
import type { ApiResponse, FileListItem, FileMetadata, StorageInfo } from '../lib/types';

export const storageApi = {
  // Get directory content from Google Drive
  async getFiles(folderId?: string): Promise<FileListItem[]> {
    const params = folderId ? { folderId } : {};
    const response = await api.get<ApiResponse<FileListItem[]>>('/storage/files', { params });
    
    if (!response.data.success) {
      throw new Error('Failed to fetch files from storage');
    }
    
    return response.data.data;
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
  async searchFiles(query: string, folderId?: string): Promise<FileListItem[]> {
    const params = { q: query, ...(folderId && { folderId }) };
    const response = await api.get<ApiResponse<FileListItem[]>>('/storage/search', { params });
    
    if (!response.data.success) {
      throw new Error('Failed to search files in storage');
    }
    
    return response.data.data;
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