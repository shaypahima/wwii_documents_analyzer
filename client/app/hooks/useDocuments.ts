import { useState, useEffect } from 'react';
import { documentsApi, type DocumentFilters } from '../api/documents';
import type { Document, DocumentStats, SearchResult, AnalysisResult } from '../lib/types';

export function useDocuments(filters: DocumentFilters = {}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async (newFilters: DocumentFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentsApi.getDocuments({ ...filters, ...newFilters });
      console.log(data, 'data from useDocuments');

      setDocuments(data.documents);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);
  return {
    documents,
    total,
    loading,
    error,
    fetchDocuments,
    refetch: () => fetchDocuments(),
  };
}

export function useDocument(id?: string) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDocument = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await documentsApi.getDocument(id);
        setDocument(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  return { document, loading, error };
}

export function useDocumentSearch() {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDocuments = async (query: string, page = 1, limit = 20) => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await documentsApi.searchDocuments(query, page, limit);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search documents');
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    searchDocuments,
  };
}

export function useDocumentStats() {
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await documentsApi.getDocumentStats();
        setStats(data);
      } catch (err) {
        console.warn('Failed to fetch document stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
        // Set default stats if API is not available
        setStats({
          totalDocuments: 0,
          documentsByType: {},
          recentDocuments: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

export function useDocumentAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeDocument = async (fileId: string) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const data = await documentsApi.analyzeDocument(fileId);
      setAnalysis(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze document');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    analysis,
    loading,
    error,
    analyzeDocument,
  };
}

export function useDocumentProcessor() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processAndSave = async (fileId: string): Promise<Document> => {
    setProcessing(true);
    setError(null);
    try {
      const document = await documentsApi.processAndSaveDocument(fileId);
      return document;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process document');
      throw err;
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    error,
    processAndSave,
  };
} 