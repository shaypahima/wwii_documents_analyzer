import { Request, Response } from 'express';
import { EntityService, entityService } from '../services/EntityService';
import { EntityType } from '@prisma/client';
import { AppError, HttpStatusCode } from '../types/common';
import { SUCCESS_MESSAGES } from '../utils/constants';
import { logger } from '../utils/logger';

export class EntityController {
  private entityService: EntityService;

  constructor() {
    this.entityService = entityService
  }

  /**
   * Create a new entity
   */
  createEntity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, type, date } = req.body;

      // Validate required fields
      if (!name || !type) {
        throw new AppError('Name and type are required', HttpStatusCode.BAD_REQUEST);
      }

      // Validate entity type
      if (!Object.values(EntityType).includes(type)) {
        throw new AppError('Invalid entity type', HttpStatusCode.BAD_REQUEST);
      }

      const entity = await this.entityService.createEntity({ name, type, date });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.ENTITY_CREATED,
        data: entity,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to create entity');
    }
  };

  /**
   * Get entity by ID
   */
  getEntity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const includeDocuments = req.query.includeDocuments === 'true';

      if (!id) {
        throw new AppError('Entity ID is required', HttpStatusCode.BAD_REQUEST);
      }

      const entity = await this.entityService.getEntityById(id, includeDocuments);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: entity,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get entity');
    }
  };

  /**
   * Get all entities with filters and pagination
   */
  getEntities = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '10',
        type,
        keyword,
        date
      } = req.query;

      // Parse and validate query parameters
      const params = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        type: type as EntityType,
        keyword: keyword as string,
        date: date as string,
      };

      // Validate pagination
      if (params.page < 1) {
        throw new AppError('Page must be greater than 0', HttpStatusCode.BAD_REQUEST);
      }

      if (params.limit < 1 || params.limit > 100) {
        throw new AppError('Limit must be between 1 and 100', HttpStatusCode.BAD_REQUEST);
      }

      // Validate entity type if provided
      if (params.type && !Object.values(EntityType).includes(params.type)) {
        throw new AppError('Invalid entity type', HttpStatusCode.BAD_REQUEST);
      }

      const result = await this.entityService.getEntities(params);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: result.entities,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get entities');
    }
  };

  /**
   * Update entity
   */
  updateEntity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, type, date } = req.body;

      if (!id) {
        throw new AppError('Entity ID is required', HttpStatusCode.BAD_REQUEST);
      }

      // Validate entity type if provided
      if (type && !Object.values(EntityType).includes(type)) {
        throw new AppError('Invalid entity type', HttpStatusCode.BAD_REQUEST);
      }

      const entity = await this.entityService.updateEntity(id, { name, type, date });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.ENTITY_UPDATED,
        data: entity,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to update entity');
    }
  };

  /**
   * Delete entity
   */
  deleteEntity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Entity ID is required', HttpStatusCode.BAD_REQUEST);
      }

      await this.entityService.deleteEntity(id);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.ENTITY_DELETED,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to delete entity');
    }
  };

  /**
   * Search entities
   */
  searchEntities = async (req: Request, res: Response): Promise<void> => {
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

      const result = await this.entityService.searchEntities(query.trim(), page, limit);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.SEARCH_COMPLETED,
        data: result.entities,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to search entities');
    }
  };

  /**
   * Find or create entity
   */
  findOrCreateEntity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, type, date } = req.body;

      // Validate required fields
      if (!name || !type) {
        throw new AppError('Name and type are required', HttpStatusCode.BAD_REQUEST);
      }

      // Validate entity type
      if (!Object.values(EntityType).includes(type)) {
        throw new AppError('Invalid entity type', HttpStatusCode.BAD_REQUEST);
      }

      const entity = await this.entityService.findOrCreateEntity({ name, type, date });

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: entity,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to find or create entity');
    }
  };

  /**
   * Get entities by type
   */
  getEntitiesByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      if (!type) {
        throw new AppError('Entity type is required', HttpStatusCode.BAD_REQUEST);
      }

      // Validate entity type
      if (!Object.values(EntityType).includes(type as EntityType)) {
        throw new AppError('Invalid entity type', HttpStatusCode.BAD_REQUEST);
      }

      // Validate pagination
      if (page < 1) {
        throw new AppError('Page must be greater than 0', HttpStatusCode.BAD_REQUEST);
      }

      if (limit < 1 || limit > 100) {
        throw new AppError('Limit must be between 1 and 100', HttpStatusCode.BAD_REQUEST);
      }

      const result = await this.entityService.getEntitiesByType(type as EntityType, page, limit);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: result.entities,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get entities by type');
    }
  };

  /**
   * Get entity statistics
   */
  getEntityStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.entityService.getEntityStats();

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get entity statistics');
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