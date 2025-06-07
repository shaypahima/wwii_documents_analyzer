export interface FileListItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  type: string;
  modifiedTime: string;
  createdTime: string;
  isFolder: boolean;
}

export interface FileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  modifiedTime: string;
  createdTime: string;
  parents?: string[];
}

export interface Document {
  id: string;
  title: string;
  content: string;
  documentType: DocumentType;
  fileId: string;
  fileName: string;
  filePath?: string;
  mimeType: string;
  fileSize: number;
  imageUrl?: string;
  entities: Entity[];
  createdAt: string;
  updatedAt: string;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  date?: string;
  documents?: Document[];
  _count?: {
    documents: number;
  };
}

export interface DocumentStats {
  totalDocuments: number;
  documentsByType: Record<string, number>;
  recentDocuments: Document[];
}

export interface SearchResult {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
}

export interface EntitySearchResult {
  entities: Entity[];
  total: number;
  page: number;
  limit: number;
}

export interface StorageInfo {
  limit: string;
  usage: string;
  usageInDrive: string;
}

export interface AnalysisResult {
  analysis: {
    title: string;
    content: string;
    documentType: DocumentType;
    entities: Array<{
      name: string;
      type: EntityType;
    }>;
  };
  image: string;
  fileName: string;
  fileId?: string;
  processedAt: string;
}

export type DocumentType = 
  | 'letter'
  | 'report'
  | 'photo'
  | 'newspaper'
  | 'list'
  | 'diary_entry'
  | 'book'
  | 'map'
  | 'biography';

export type EntityType = 
  | 'person'
  | 'location'
  | 'organization'
  | 'event'
  | 'date'
  | 'unit';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
  timestamp: string;
} 