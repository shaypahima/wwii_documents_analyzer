import { EntityRepository } from '../repositories/EntityRepository';
import { CacheService, cacheService } from './CacheService';
import { EntityType } from '@prisma/client';
import { DatabaseEntity } from '../types/database';
import { AppError } from '../types/common';
import { CACHE_KEYS, CACHE_TTL } from '../utils/constants';
import { logger } from '../utils/logger';

export class EntityService {
  private entityRepository: EntityRepository;
  private cacheService: CacheService;

  constructor(cacheService: CacheService) {
    this.entityRepository = new EntityRepository();
    this.cacheService = cacheService;
  }

  /**
   * Create a new entity
   */
  async createEntity(data: {
    name: string;
    type: EntityType;
    date?: string;
  }): Promise<DatabaseEntity> {
    try {
      const entity = await this.entityRepository.create(data);
      
      // Clear relevant caches
      this.clearEntityCaches();
      
      return entity;
    } catch (error) {
      logger.error('Failed to create entity:', error);
      throw new AppError('Failed to create entity');
    }
  }

  /**
   * Get entity by ID
   */
  async getEntityById(id: string, includeDocuments = false): Promise<DatabaseEntity> {
    try {
      const cacheKey = `${CACHE_KEYS.ENTITY}_${id}_${includeDocuments}`;
      
      // Check cache first
      const cached = this.cacheService.get<DatabaseEntity>(cacheKey);
      if (cached) {
        return cached;
      }

      const entity = await this.entityRepository.findById(id, includeDocuments);
      if (!entity) {
        throw new AppError('Entity not found', 404);
      }

      // Cache the result
      this.cacheService.set(cacheKey, entity, CACHE_TTL.MEDIUM);
      
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Failed to get entity ${id}:`, error);
      throw new AppError('Failed to retrieve entity');
    }
  }

  /**
   * Get all entities with filters and pagination
   */
  async getEntities(params: {
    page?: number;
    limit?: number;
    type?: EntityType;
    keyword?: string;
    date?: string;
  }): Promise<{
    entities: DatabaseEntity[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        keyword,
        date,
      } = params;

      // Create cache key based on parameters
      const cacheKey = `${CACHE_KEYS.ENTITY}_list_${JSON.stringify(params)}`;
      
      // Check cache
      const cached = this.cacheService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const filters = {
        page,
        limit,
        type,
        keyword,
        date,
      };

      const result = await this.entityRepository.findMany(filters);
      
      const response = {
        ...result,
        page,
        limit,
      };

      // Cache for short time due to pagination
      this.cacheService.set(cacheKey, response, CACHE_TTL.SHORT);
      
      return response;
    } catch (error) {
      logger.error('Failed to get entities:', error);
      throw new AppError('Failed to retrieve entities');
    }
  }

  /**
   * Update entity
   */
  async updateEntity(
    id: string,
    data: {
      name?: string;
      type?: EntityType;
      date?: string;
    }
  ): Promise<DatabaseEntity> {
    try {
      const entity = await this.entityRepository.update(id, data);
      
      // Clear caches
      this.clearEntityCaches();
      this.cacheService.delete(`${CACHE_KEYS.ENTITY}_${id}_true`);
      this.cacheService.delete(`${CACHE_KEYS.ENTITY}_${id}_false`);
      
      return entity;
    } catch (error) {
      logger.error(`Failed to update entity ${id}:`, error);
      throw new AppError('Failed to update entity');
    }
  }

  /**
   * Delete entity
   */
  async deleteEntity(id: string): Promise<void> {
    try {
      await this.entityRepository.delete(id);
      
      // Clear caches
      this.clearEntityCaches();
      this.cacheService.delete(`${CACHE_KEYS.ENTITY}_${id}_true`);
      this.cacheService.delete(`${CACHE_KEYS.ENTITY}_${id}_false`);
    } catch (error) {
      logger.error(`Failed to delete entity ${id}:`, error);
      throw new AppError('Failed to delete entity');
    }
  }

  /**
   * Search entities
   */
  async searchEntities(
    query: string,
    page = 1,
    limit = 10
  ): Promise<{
    entities: DatabaseEntity[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }> {
    try {
      const cacheKey = `${CACHE_KEYS.SEARCH}_entities_${query}_${page}_${limit}`;
      
      // Check cache
      const cached = this.cacheService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.entityRepository.search(query, page, limit);
      
      const response = {
        ...result,
        page,
        limit,
      };

      // Cache search results
      this.cacheService.set(cacheKey, response, CACHE_TTL.SHORT);
      
      return response;
    } catch (error) {
      logger.error('Failed to search entities:', error);
      throw new AppError('Failed to search entities');
    }
  }

  /**
   * Find or create entity
   */
  async findOrCreateEntity(data: {
    name: string;
    type: EntityType;
    date?: string;
  }): Promise<DatabaseEntity> {
    try {
      const entity = await this.entityRepository.findOrCreate(data);
      
      // Clear caches if new entity was created
      this.clearEntityCaches();
      
      return entity;
    } catch (error) {
      logger.error('Failed to find or create entity:', error);
      throw new AppError('Failed to find or create entity');
    }
  }

  /**
   * Get entities by type
   */
  async getEntitiesByType(
    type: EntityType,
    page = 1,
    limit = 10
  ): Promise<{
    entities: DatabaseEntity[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }> {
    try {
      const cacheKey = `${CACHE_KEYS.ENTITY}_type_${type}_${page}_${limit}`;
      
      // Check cache
      const cached = this.cacheService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.entityRepository.findByType(type, page, limit);
      
      const response = {
        ...result,
        page,
        limit,
      };

      // Cache the result
      this.cacheService.set(cacheKey, response, CACHE_TTL.MEDIUM);
      
      return response;
    } catch (error) {
      logger.error(`Failed to get entities by type ${type}:`, error);
      throw new AppError('Failed to get entities by type');
    }
  }

  /**
   * Get entity statistics
   */
  async getEntityStats(): Promise<{
    totalEntities: number;
    entitiesByType: Record<EntityType, number>;
    topEntities: Array<{
      id: string;
      name: string;
      type: EntityType;
      documentCount: number;
    }>;
  }> {
    try {
      const cacheKey = `${CACHE_KEYS.STATS}_entities`;
      
      // Check cache
      const cached = this.cacheService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const stats = await this.entityRepository.getStats();

      // Cache for longer time
      this.cacheService.set(cacheKey, stats, CACHE_TTL.LONG);
      
      return stats;
    } catch (error) {
      logger.error('Failed to get entity stats:', error);
      throw new AppError('Failed to get entity statistics');
    }
  }

  /**
   * Clear entity-related caches
   */
  private clearEntityCaches(): void {
    const keys = this.cacheService.getKeys(`${CACHE_KEYS.ENTITY}_*`);
    keys.forEach(key => this.cacheService.delete(key));
    
    const searchKeys = this.cacheService.getKeys(`${CACHE_KEYS.SEARCH}_*`);
    searchKeys.forEach(key => this.cacheService.delete(key));
    
    const statsKeys = this.cacheService.getKeys(`${CACHE_KEYS.STATS}_*`);
    statsKeys.forEach(key => this.cacheService.delete(key));
  }
}

export const entityService = new EntityService(cacheService);