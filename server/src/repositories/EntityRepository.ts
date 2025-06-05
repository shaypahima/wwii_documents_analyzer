import { prisma } from '../config/database';
import { EntityType } from '@prisma/client';
import { DatabaseEntity } from '../types/database';
import { AppError } from '../types/common';
import { logger } from '../utils/logger';

export class EntityRepository {
  /**
   * Create a new entity
   */
  async create(data: {
    name: string;
    type: EntityType;
    date?: string;
  }): Promise<DatabaseEntity> {
    try {
      const entity = await prisma.entity.create({
        data: {
          name: data.name,
          type: data.type,
          date: data.date,
        },
        include: {
          _count: {
            select: { documents: true },
          },
        },
      });

      logger.info(`Entity created: ${entity.id}`);
      return entity;
    } catch (error) {
      logger.error('Failed to create entity:', error);
      throw new AppError('Failed to create entity');
    }
  }

  /**
   * Get entity by ID
   */
  async findById(id: string, includeDocuments = false): Promise<DatabaseEntity | null> {
    try {
      const entity = await prisma.entity.findUnique({
        where: { id },
        include: {
          documents: includeDocuments,
          _count: {
            select: { documents: true },
          },
        },
      });

      return entity as DatabaseEntity;
    } catch (error) {
      logger.error(`Failed to find entity ${id}:`, error);
      throw new AppError('Failed to retrieve entity');
    }
  }

  /**
   * Get all entities with pagination and filters
   */
  async findMany(params: {
    page?: number;
    limit?: number;
    type?: EntityType;
    keyword?: string;
    date?: string;
  }): Promise<{
    entities: DatabaseEntity[];
    total: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, type, keyword, date } = params;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (keyword) {
        where.name = { contains: keyword, mode: 'insensitive' };
      }

      if (date) {
        where.date = { contains: date };
      }

      const [entities, total] = await Promise.all([
        prisma.entity.findMany({
          where,
          include: {
            _count: {
              select: { documents: true },
            },
          },
          orderBy: { name: 'asc' },
          skip,
          take: limit,
        }),
        prisma.entity.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return { entities, total, totalPages };
    } catch (error) {
      logger.error('Failed to find entities:', error);
      throw new AppError('Failed to retrieve entities');
    }
  }

  /**
   * Update entity
   */
  async update(
    id: string,
    data: {
      name?: string;
      type?: EntityType;
      date?: string;
    }
  ): Promise<DatabaseEntity> {
    try {
      const updateData: any = {};

      if (data.name) updateData.name = data.name;
      if (data.type) updateData.type = data.type;
      if (data.date !== undefined) updateData.date = data.date;

      const entity = await prisma.entity.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: { documents: true },
          },
        },
      });

      logger.info(`Entity updated: ${entity.id}`);
      return entity;
    } catch (error) {
      logger.error(`Failed to update entity ${id}:`, error);
      throw new AppError('Failed to update entity');
    }
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.entity.delete({
        where: { id },
      });

      logger.info(`Entity deleted: ${id}`);
    } catch (error) {
      logger.error(`Failed to delete entity ${id}:`, error);
      throw new AppError('Failed to delete entity');
    }
  }

  /**
   * Search entities
   */
  async search(query: string, page = 1, limit = 10): Promise<{
    entities: DatabaseEntity[];
    total: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const where : any= {
        name: { contains: query, mode: 'insensitive' },
      };

      const [entities, total] = await Promise.all([
        prisma.entity.findMany({
          where,
          include: {
            _count: {
              select: { documents: true },
            },
          },
          orderBy: { name: 'asc' },
          skip,
          take: limit,
        }),
        prisma.entity.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return { entities, total, totalPages };
    } catch (error) {
      logger.error('Failed to search entities:', error);
      throw new AppError('Failed to search entities');
    }
  }

  /**
   * Find or create entity
   */
  async findOrCreate(data: {
    name: string;
    type: EntityType;
    date?: string;
  }): Promise<DatabaseEntity> {
    try {
      // Try to find existing entity
      const existing = await prisma.entity.findFirst({
        where: {
          name: data.name,
          type: data.type,
        },
        include: {
          _count: {
            select: { documents: true },
          },
        },
      });

      if (existing) {
        return existing;
      }

      // Create new entity
      return await this.create(data);
    } catch (error) {
      logger.error('Failed to find or create entity:', error);
      throw new AppError('Failed to find or create entity');
    }
  }

  /**
   * Get entities by type
   */
  async findByType(type: EntityType, page = 1, limit = 10): Promise<{
    entities: DatabaseEntity[];
    total: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const where = { type };

      const [entities, total] = await Promise.all([
        prisma.entity.findMany({
          where,
          include: {
            _count: {
              select: { documents: true },
            },
          },
          orderBy: { name: 'asc' },
          skip,
          take: limit,
        }),
        prisma.entity.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return { entities, total, totalPages };
    } catch (error) {
      logger.error(`Failed to find entities by type ${type}:`, error);
      throw new AppError('Failed to find entities by type');
    }
  }

  /**
   * Get entity statistics
   */
  async getStats(): Promise<{
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
      const [totalEntities, entitiesByType, topEntities] = await Promise.all([
        prisma.entity.count(),
        prisma.entity.groupBy({
          by: ['type'],
          _count: true,
        }),
        prisma.entity.findMany({
          include: {
            _count: {
              select: { documents: true },
            },
          },
          orderBy: {
            documents: {
              _count: 'desc',
            },
          },
          take: 10,
        }),
      ]);

      const typeStats = entitiesByType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<EntityType, number>);

      const topEntitiesFormatted = topEntities.map((entity) => ({
        id: entity.id,
        name: entity.name,
        type: entity.type,
        documentCount: entity._count.documents,
      }));

      return {
        totalEntities,
        entitiesByType: typeStats,
        topEntities: topEntitiesFormatted,
      };
    } catch (error) {
      logger.error('Failed to get entity stats:', error);
      throw new AppError('Failed to get entity statistics');
    }
  }
}

export const entityRepository = new EntityRepository();