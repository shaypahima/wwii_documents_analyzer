import { useState, useEffect } from 'react';
import { storageApi } from '../api/storage';
import { sanitizeFilename } from '../lib/utils';
import type { FileListItem, FileMetadata, StorageInfo } from '../lib/types';

export function useStorage() {
  const [files, setFiles] = useState<FileListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFiles = async (folderId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await storageApi.getFiles(folderId);
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const searchFiles = async (query: string, folderId?: string) => {
    setLoading(true);
    setError(null);
    try {
      
      const data = await storageApi.searchFiles(query, folderId);
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search files');
    } finally {
      setLoading(false);
    }
  };

  return {
    files,
    loading,
    error,
    getFiles,
    searchFiles,
    refetch: () => getFiles(),
  };
}

export function useFileMetadata(fileId?: string) {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) return;

    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await storageApi.getFileMetadata(fileId);
        setMetadata(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metadata');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [fileId]);

  return { metadata, loading, error };
}

export function useStorageInfo() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStorageInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await storageApi.getStorageInfo();
        setStorageInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch storage info');
      } finally {
        setLoading(false);
      }
    };

    fetchStorageInfo();
  }, []);

  return { storageInfo, loading, error };
}

export function useFileDownload() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadFile = async (fileId: string, fileName: string) => {
    setDownloading(true);
    setError(null);
    try {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  return { downloadFile, downloading, error };
} 