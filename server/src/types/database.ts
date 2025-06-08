import { DocumentType, EntityType } from '@prisma/client';
// Base database types
export interface DatabaseDocument {
  id: string;
  title: string;
  fileName: string;
  content: string;
  imageUrl?: string | null;
  documentType: DocumentType;
  createdAt: Date;
  updatedAt: Date;
  entities?: DatabaseEntity[];
}

export interface DatabaseEntity {
  id: string;
  name: string;
  date?: string | null;
  type: EntityType;
  documents?: DatabaseDocument[];
  _count?: {
    documents: number;
  };
}

// Entity for creation/processing
export interface Entity {
  id?: string;
  name: string;
  date?: string | null;
  type: EntityType;
  documents?: DatabaseDocument[];
}

// Document for creation/processing
export interface Document {
  id?: string;
  title: string;
  fileName: string;
  content: string;
  imageUrl?: string;
  documentType: DocumentType;
  createdAt?: Date;
  updatedAt?: Date;
  entities: Entity[];
}
// Parsed analysis from AI
export interface ParsedAnalysis {
  documentType: DocumentType;
  title: string;
  content: string;
  entities: Entity[];
}

// File handling
export interface File {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  data?: Buffer;
  modifiedTime?: string;
  createdTime?: string;
  parents?: string[];
}

export interface FileListItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  type: string;
  modifiedTime?: string;
  createdTime?: string;
  isFolder: boolean;
}
