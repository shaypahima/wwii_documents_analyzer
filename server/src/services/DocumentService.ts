import { DocumentRepository } from '../repositories/DocumentRepository';
import { StorageService, storageService } from './StorageService';
import { AIService, aiService } from './AIService';
import { CacheService, cacheService } from './CacheService';
import { DocumentType } from '@prisma/client';
import { DatabaseDocument, Entity, ParsedAnalysis } from '../types/database';
import { AnalysisResult, ProcessDocumentOptions } from '../types/api';
import { AppError } from '../types/common';
import { documentToImage } from '../utils/helpers';
import { CACHE_KEYS, CACHE_TTL } from '../utils/constants';
import { logger } from '../utils/logger';

export class DocumentService {
  private documentRepository: DocumentRepository;
  private storageService: StorageService;
  private aiService: AIService;
  private cacheService: CacheService;

  constructor(
    storageService: StorageService,
    aiService: AIService,
    cacheService: CacheService
  ) {
    this.documentRepository = new DocumentRepository();
    this.storageService = storageService;
    this.aiService = aiService;
    this.cacheService = cacheService;
  }

  /**
   * Create a new document
   */
  async createDocument(data: {
    title: string;
    fileName: string;
    content: string;
    imageUrl?: string;
    documentType: DocumentType;
    entities: Entity[];
  }): Promise<DatabaseDocument> {
    try {
      const document = await this.documentRepository.create(data);
      
      // Clear relevant caches
      this.clearDocumentCaches();
      
      return document;
    } catch (error) {
      logger.error('Failed to create document:', error);
      throw new AppError('Failed to create document');
    }
  }

  /**
   * Get document by ID
   */
  async getDocumentById(id: string): Promise<DatabaseDocument> {
    try {
      const cacheKey = `${CACHE_KEYS.DOCUMENT}_${id}`;
      
      // Check cache first
      const cached = this.cacheService.get<DatabaseDocument>(cacheKey);
      if (cached) {
        return cached;
      }

      const document = await this.documentRepository.findById(id);
      if (!document) {
        throw new AppError('Document not found', 404);
      }

      // Cache the result
      this.cacheService.set(cacheKey, document, CACHE_TTL.MEDIUM);
      
      return document;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Failed to get document ${id}:`, error);
      throw new AppError('Failed to retrieve document');
    }
  }

  /**
   * Get all documents with filters and pagination
   */
  async getDocuments(params: {
    page?: number;
    limit?: number;
    documentType?: DocumentType;
    keyword?: string;
    entity?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    documents: DatabaseDocument[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        documentType,
        keyword,
        entity,
        startDate,
        endDate,
      } = params;

      // Create cache key based on parameters
      const cacheKey = `${CACHE_KEYS.DOCUMENT}_list_${JSON.stringify(params)}`;
      
      // Check cache
      const cached = this.cacheService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const filters = {
        page,
        limit,
        documentType,
        keyword,
        entity,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };

      const result = await this.documentRepository.findMany(filters);
      
      const response = {
        ...result,
        page,
        limit,
      };

      // Cache for short time due to pagination
      this.cacheService.set(cacheKey, response, CACHE_TTL.SHORT);
      
      return response;
    } catch (error) {
      logger.error('Failed to get documents:', error);
      throw new AppError('Failed to retrieve documents');
    }
  }

  /**
   * Update document
   */
  async updateDocument(
    id: string,
    data: {
      title?: string;
      content?: string;
      imageUrl?: string;
      documentType?: DocumentType;
      entities?: Entity[];
    }
  ): Promise<DatabaseDocument> {
    try {
      const document = await this.documentRepository.update(id, data);
      
      // Clear caches
      this.clearDocumentCaches();
      this.cacheService.delete(`${CACHE_KEYS.DOCUMENT}_${id}`);
      
      return document;
    } catch (error) {
      logger.error(`Failed to update document ${id}:`, error);
      throw new AppError('Failed to update document');
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      await this.documentRepository.delete(id);
      
      // Clear caches
      this.clearDocumentCaches();
      this.cacheService.delete(`${CACHE_KEYS.DOCUMENT}_${id}`);
    } catch (error) {
      logger.error(`Failed to delete document ${id}:`, error);
      throw new AppError('Failed to delete document');
    }
  }

  /**
   * Search documents
   */
  async searchDocuments(
    query: string,
    page = 1,
    limit = 10
  ): Promise<{
    documents: DatabaseDocument[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }> {
    try {
      const cacheKey = `${CACHE_KEYS.SEARCH}_docs_${query}_${page}_${limit}`;
      
      // Check cache
      const cached = this.cacheService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.documentRepository.search(query, page, limit);
      
      const response = {
        ...result,
        page,
        limit,
      };

      // Cache search results
      this.cacheService.set(cacheKey, response, CACHE_TTL.SHORT);
      
      return response;
    } catch (error) {
      logger.error('Failed to search documents:', error);
      throw new AppError('Failed to search documents');
    }
  }

  /**
   * Process document from Google Drive
   */
  async processDocument(
    fileId: string,
    options: ProcessDocumentOptions = {}
  ): Promise<AnalysisResult> {
    try {
      const { autoSave = false, forceRefresh = false } = options;

      // Check cache first (unless force refresh)
      const cacheKey = `${CACHE_KEYS.ANALYSIS}_${fileId}`;
      if (!forceRefresh) {
        const cached = this.cacheService.get<AnalysisResult>(cacheKey);
        if (cached) {
          logger.info(`Returning cached analysis for file ${fileId}`);
          return cached;
        }
      }

      logger.info(`Processing document from Google Drive: ${fileId}`);

      // Get file from Google Drive
      const file = await this.storageService.getFileContent(fileId);
      
      // Convert to image
      const imageDataUrl = await documentToImage(file);

      // Analyze with AI
      const analysisText = await this.aiService.analyzeImage(imageDataUrl);
      const analysis = this.aiService.parseAnalysis(analysisText);

      const result: AnalysisResult = {
        analysis,
        image: imageDataUrl,
        fileName: file.name,
        fileId,
        processedAt: new Date().toISOString(),
      };

      // Auto-save if requested
      if (autoSave) {
        const savedDocument = await this.createDocument({
          title: analysis.title,
          fileName: file.name,
          content: analysis.content,
          imageUrl: imageDataUrl,
          documentType: analysis.documentType,
          entities: analysis.entities,
        });
        result.savedDocument = savedDocument;
      }

      // Cache the result
      this.cacheService.set(cacheKey, result, CACHE_TTL.LONG);

      logger.info(`Document processing completed for file ${fileId}`);
      return result;
    } catch (error) {
      logger.error(`Failed to process document ${fileId}:`, error);
      throw new AppError(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get documents by entity
   */
  async getDocumentsByEntity(
    entityId: string,
    page = 1,
    limit = 10
  ): Promise<{
    documents: DatabaseDocument[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }> {
    try {
      const cacheKey = `${CACHE_KEYS.DOCUMENT}_entity_${entityId}_${page}_${limit}`;
      
      // Check cache
      const cached = this.cacheService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.documentRepository.findByEntity(entityId, page, limit);
      
      const response = {
        ...result,
        page,
        limit,
      };

      // Cache the result
      this.cacheService.set(cacheKey, response, CACHE_TTL.MEDIUM);
      
      return response;
    } catch (error) {
      logger.error(`Failed to get documents by entity ${entityId}:`, error);
      throw new AppError('Failed to get documents by entity');
    }
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(): Promise<{
    totalDocuments: number;
    documentsByType: Record<DocumentType, number>;
    recentDocuments: DatabaseDocument[];
  }> {
    try {
      const cacheKey = `${CACHE_KEYS.STATS}_documents`;
      
      // Check cache
      const cached = this.cacheService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      // Get basic stats from recent documents query
      const recentResult = await this.documentRepository.findMany({
        page: 1,
        limit: 5,
      });

      // For document type breakdown, we'd need to add this to repository
      // For now, return basic stats
      const stats = {
        totalDocuments: recentResult.total,
        documentsByType: {} as Record<DocumentType, number>,
        recentDocuments: recentResult.documents,
      };

      // Cache for longer time
      this.cacheService.set(cacheKey, stats, CACHE_TTL.LONG);
      
      return stats;
    } catch (error) {
      logger.error('Failed to get document stats:', error);
      throw new AppError('Failed to get document statistics');
    }
  }

  /**
   * Clear document-related caches
   */
  private clearDocumentCaches(): void {
    const keys = this.cacheService.getKeys(`${CACHE_KEYS.DOCUMENT}_*`);
    keys.forEach(key => this.cacheService.delete(key));
    
    const searchKeys = this.cacheService.getKeys(`${CACHE_KEYS.SEARCH}_*`);
    searchKeys.forEach(key => this.cacheService.delete(key));
    
    const statsKeys = this.cacheService.getKeys(`${CACHE_KEYS.STATS}_*`);
    statsKeys.forEach(key => this.cacheService.delete(key));
  }
}

export const documentService = new DocumentService(storageService, aiService, cacheService);