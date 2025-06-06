import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageApi } from '../api/storage';
import { sanitizeFilename } from '../lib/utils';
import type { FileListItem, FileMetadata, StorageInfo } from '../lib/types';

// Query Keys
export const storageKeys = {
  all: ['storage'] as const,
  files: () => [...storageKeys.all, 'files'] as const,
  filesList: (folderId?: string, page?: number, limit?: number) => 
    [...storageKeys.files(), { folderId, page, limit }] as const,
  search: (query: string, folderId?: string, page?: number, limit?: number) => 
    [...storageKeys.all, 'search', { query, folderId, page, limit }] as const,
  metadata: () => [...storageKeys.all, 'metadata'] as const,
  fileMetadata: (fileId: string) => [...storageKeys.metadata(), fileId] as const,
  info: () => [...storageKeys.all, 'info'] as const,
};

// Storage Files Hook
export function useStorage(folderId?: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: storageKeys.filesList(folderId, page, limit),
    queryFn: () => storageApi.getFiles(folderId, page, limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Storage Search Hook
export function useStorageSearch(query: string, folderId?: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: storageKeys.search(query, folderId, page, limit),
    queryFn: () => storageApi.searchFiles(query, folderId, page, limit),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// File Metadata Hook
export function useFileMetadata(fileId?: string) {
  return useQuery({
    queryKey: storageKeys.fileMetadata(fileId!),
    queryFn: () => storageApi.getFileMetadata(fileId!),
    enabled: !!fileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Storage Info Hook
export function useStorageInfo() {
  return useQuery({
    queryKey: storageKeys.info(),
    queryFn: () => storageApi.getStorageInfo(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// File Download Hook (Mutation)
export function useFileDownload() {
  return useMutation({
    mutationFn: async ({ fileId, fileName }: { fileId: string; fileName: string }) => {
      const blob = await storageApi.downloadFile(fileId);
      
      // Create download link with sanitized filename
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = sanitizeFilename(fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

// Storage Connection Test Hook
export function useStorageTest() {
  return useQuery({
    queryKey: [...storageKeys.all, 'test'],
    queryFn: () => storageApi.testConnection(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
} 