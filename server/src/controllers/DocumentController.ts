import { Request, Response } from 'express';
import { DocumentService, documentService } from '../services/DocumentService';
import { CreateDocumentRequest, UpdateDocumentRequest, AnalyzeDocumentRequest, DocumentsQueryParams } from '../types/api';
import { AppError, HttpStatusCode } from '../types/common';
import { DocumentType } from '@prisma/client';
import { SUCCESS_MESSAGES } from '../utils/constants';
import { logger } from '../utils/logger';

export class DocumentController {
  private documentService: DocumentService;

  constructor() {
    this.documentService = documentService
  }

  /**
   * Create a new document
   */
  createDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: CreateDocumentRequest = req.body;

      // Validate required fields
      if (!data.title || !data.fileName || !data.content || !data.documentType) {
        throw new AppError('Missing required fields', HttpStatusCode.BAD_REQUEST);
      }

      // Validate document type
      if (!Object.values(DocumentType).includes(data.documentType)) {
        throw new AppError('Invalid document type', HttpStatusCode.BAD_REQUEST);
      }

      const document = await this.documentService.createDocument(data);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.DOCUMENT_CREATED,
        data: document,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to create document');
    }
  };

  /**
   * Get document by ID
   */
  getDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Document ID is required', HttpStatusCode.BAD_REQUEST);
      }

      const document = await this.documentService.getDocumentById(id);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: document,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get document');
    }
  };

  /**
   * Get all documents with filters and pagination
   */
  getDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      const query: DocumentsQueryParams = req.query;

      // Parse and validate query parameters
      const params = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 10,
        documentType: query.documentType as DocumentType,
        keyword: query.keyword,
        entity: query.entity,
        startDate: query.startDate,
        endDate: query.endDate,
      };

      // Validate pagination
      if (params.page < 1) {
        throw new AppError('Page must be greater than 0', HttpStatusCode.BAD_REQUEST);
      }

      if (params.limit < 1 || params.limit > 100) {
        throw new AppError('Limit must be between 1 and 100', HttpStatusCode.BAD_REQUEST);
      }

      // Validate document type if provided
      if (params.documentType && !Object.values(DocumentType).includes(params.documentType)) {
        throw new AppError('Invalid document type', HttpStatusCode.BAD_REQUEST);
      }

      const result = await this.documentService.getDocuments(params);

      res.status(HttpStatusCode.OK).json({
        success: true,
        documents: result.documents,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get documents');
    }
  };

  /**
   * Update document
   */
  updateDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateDocumentRequest = req.body;

      if (!id) {
        throw new AppError('Document ID is required', HttpStatusCode.BAD_REQUEST);
      }

      // Validate document type if provided
      if (data.documentType && !Object.values(DocumentType).includes(data.documentType)) {
        throw new AppError('Invalid document type', HttpStatusCode.BAD_REQUEST);
      }

      const document = await this.documentService.updateDocument(id, data);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DOCUMENT_UPDATED,
        data: document,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to update document');
    }
  };

  /**
   * Delete document
   */
  deleteDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Document ID is required', HttpStatusCode.BAD_REQUEST);
      }

      await this.documentService.deleteDocument(id);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DOCUMENT_DELETED,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to delete document');
    }
  };

  /**
   * Search documents
   */
  searchDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q: query } = req.query;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      if (!query || typeof query !== 'string') {
        throw new AppError('Search query is required', HttpStatusCode.BAD_REQUEST);
      }

      if (query.trim().length < 2) {
        throw new AppError('Search query must be at least 2 characters', HttpStatusCode.BAD_REQUEST);
      }

      // Validate pagination
      if (page < 1) {
        throw new AppError('Page must be greater than 0', HttpStatusCode.BAD_REQUEST);
      }

      if (limit < 1 || limit > 100) {
        throw new AppError('Limit must be between 1 and 100', HttpStatusCode.BAD_REQUEST);
      }

      const result = await this.documentService.searchDocuments(query.trim(), page, limit);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.SEARCH_COMPLETED,
        data: result.documents,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to search documents');
    }
  };

  /**
   * Analyze document from Google Drive
   */
  analyzeDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fileId } = req.params;
      // const { forceRefresh = false, includeImage = true }: AnalyzeDocumentRequest = req.body;

      if (!fileId) {
        throw new AppError('File ID is required', HttpStatusCode.BAD_REQUEST);
      }

      const result = await this.documentService.processDocument(fileId, {
        forceRefresh: true,
      });

      // Remove image data if not requested
      // if (!includeImage) {
      //   delete (result as any).image;
      // }

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.ANALYSIS_COMPLETED,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to analyze document');
    }
  };

  /**
   * Process and save document from Google Drive
   */
  processAndSaveDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fileId } = req.params;
      // const { forceRefresh = false } = req.body;
      // console.log('forceRefresh', forceRefresh);
      if (!fileId) {
        throw new AppError('File ID is required', HttpStatusCode.BAD_REQUEST);
      }

      const result = await this.documentService.processDocument(fileId, {
        autoSave: true,
        forceRefresh: true,
      });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.DOCUMENT_CREATED,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to process and save document');
    }
  };

  /**
   * Get documents by entity
   */
  getDocumentsByEntity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      if (!entityId) {
        throw new AppError('Entity ID is required', HttpStatusCode.BAD_REQUEST);
      }

      // Validate pagination
      if (page < 1) {
        throw new AppError('Page must be greater than 0', HttpStatusCode.BAD_REQUEST);
      }

      if (limit < 1 || limit > 100) {
        throw new AppError('Limit must be between 1 and 100', HttpStatusCode.BAD_REQUEST);
      }

      const result = await this.documentService.getDocumentsByEntity(entityId, page, limit);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: result.documents,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get documents by entity');
    }
  };

  /**
   * Get document statistics
   */
  getDocumentStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.documentService.getDocumentStats();

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get document statistics');
    }
  };

  /**
   * Handle errors consistently
   */
  private handleError(res: Response, error: unknown, defaultMessage: string): void {
    if (error instanceof AppError) {
      logger.warn(`${defaultMessage}: ${error.message}`);
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
      });
    } else {
      logger.error(`${defaultMessage}:`, error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: defaultMessage,
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
      });
    }
  }
}