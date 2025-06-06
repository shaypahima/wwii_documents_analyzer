import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi, type DocumentFilters } from '../api/documents';
import type { Document, DocumentStats, SearchResult, AnalysisResult } from '../lib/types';

// Query Keys
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters: DocumentFilters) => [...documentKeys.lists(), filters] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  search: (query: string, page: number, limit: number) => [...documentKeys.all, 'search', query, page, limit] as const,
  stats: () => [...documentKeys.all, 'stats'] as const,
};

// Documents List Hook
export function useDocuments(filters: DocumentFilters = {}) {
  return useQuery({
    queryKey: documentKeys.list(filters),
    queryFn: () => documentsApi.getDocuments(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Single Document Hook
export function useDocument(id?: string) {
  return useQuery({
    queryKey: documentKeys.detail(id!),
    queryFn: () => documentsApi.getDocument(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Document Search Hook
export function useDocumentSearch(query: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: documentKeys.search(query, page, limit),
    queryFn: () => documentsApi.searchDocuments(query, page, limit),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Document Stats Hook
export function useDocumentStats() {
  return useQuery({
    queryKey: documentKeys.stats(),
    queryFn: () => documentsApi.getDocumentStats(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Document Analysis Hook (Mutation)
export function useDocumentAnalysis() {
  return useMutation({
    mutationFn: (fileId: string) => documentsApi.analyzeDocument(fileId),
  });
}

// Document Processor Hook (Mutation)
export function useDocumentProcessor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (fileId: string) => documentsApi.processAndSaveDocument(fileId),
    onSuccess: () => {
      // Invalidate and refetch documents list
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() });
    },
  });
}

// Document Update Hook (Mutation)
export function useUpdateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Document> }) => 
      documentsApi.updateDocument(id, data),
    onSuccess: (updatedDocument) => {
      // Update the document in the cache
      queryClient.setQueryData(
        documentKeys.detail(updatedDocument.id),
        updatedDocument
      );
      // Invalidate lists to ensure they're up to date
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

// Document Delete Hook (Mutation)
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => documentsApi.deleteDocument(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: documentKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() });
    },
  });
}

// Documents by Entity Hook
export function useDocumentsByEntity(entityId: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: [...documentKeys.all, 'entity', entityId, page, limit],
    queryFn: () => documentsApi.getDocumentsByEntity(entityId, page, limit),
    enabled: !!entityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 