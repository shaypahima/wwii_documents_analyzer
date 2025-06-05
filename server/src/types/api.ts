import { DocumentType, EntityType } from '@prisma/client';
import type { DatabaseDocument, DatabaseEntity, Entity, ParsedAnalysis } from './database';

// Base API Response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode?: number;
  timestamp: string;
  stack?: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// Pagination Parameters
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// Validation Result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Document Analysis
export interface AnalysisResult {
  analysis: ParsedAnalysis;
  image: string;
  fileName: string;
  fileId?: string;
  processedAt: string;
  savedDocument?: DatabaseDocument;
}

// Processing Status
export interface ProcessingStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  result?: AnalysisResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// Processing Options
export interface ProcessDocumentOptions {
  autoSave?: boolean;
  async?: boolean;
  forceRefresh?: boolean;
}

// Request Types
export interface CreateDocumentRequest {
  title: string;
  fileName: string;
  content: string;
  imageUrl?: string;
  documentType: DocumentType;
  entities: Entity[];
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  imageUrl?: string;
  documentType?: DocumentType;
  entities?: Entity[];
}

export interface AnalyzeDocumentRequest {
  forceRefresh?: boolean;
  includeImage?: boolean;
}

// Query Parameters
export interface DocumentsQueryParams {
  id?: string;
  keyword?: string;
  documentType?: DocumentType;
  entity?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
}

export interface EntitiesQueryParams {
  id?: string;
  type?: EntityType;
  keyword?: string;
  entityType?: EntityType;
  date?: string;
  page?: string;
  limit?: string;
}

// Search Parameters
export interface SearchParams {
  q: string;
  type?: 'documents' | 'entities' | 'all';
  page?: number;
  limit?: number;
}

export interface SearchResults {
  documents: {
    data: DatabaseDocument[];
    total: number;
    totalPages: number;
  };
  entities: {
    data: DatabaseEntity[];
    total: number;
    totalPages: number;
  };
}
