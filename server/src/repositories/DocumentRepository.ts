import { prisma } from '../config/database';
import { DocumentType } from '@prisma/client';
import { DatabaseDocument, Entity } from '../types/database';
import { AppError } from '../types/common';
import { logger } from '../utils/logger';
import { entityRepository } from './EntityRepository';

export class DocumentRepository {
  /**
   * Create a new document
   */
  async create(data: {
    title: string;
    fileName: string;
    content: string;
    imageUrl?: string;
    documentType: DocumentType;
    entities: Entity[];
  }): Promise<DatabaseDocument> {
    try {
      // Process entities - find existing or create new ones
      const entityConnections = await Promise.all(
        data.entities.map(async (entity) => {
          const existingEntity = await entityRepository.findOrCreate({
            name: entity.name,
            type: entity.type,
            date: entity.date || undefined,
          });

          return { id: existingEntity.id };
        })
      );

      const document = await prisma.document.create({
        data: {
          title: data.title,
          fileName: data.fileName,
          content: data.content,
          imageUrl: data.imageUrl,
          documentType: data.documentType,
          entities: {
            connect: entityConnections,
          },
        },
        include: {
          entities: true,
        },
      });

      logger.info(`Document created: ${document.id}`);
      return document;
    } catch (error) {
      logger.error('Failed to create document:', error);
      throw new AppError('Failed to create document');
    }
  }

  /**
   * Get document by ID
   */
  async findById(id: string): Promise<DatabaseDocument | null> {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          entities: true,
        },
      });

      return document;
    } catch (error) {
      logger.error(`Failed to find document ${id}:`, error);
      throw new AppError('Failed to retrieve document');
    }
  }

  /**
   * Get all documents with pagination and filters
   */
  async findMany(params: {
    page?: number;
    limit?: number;
    documentType?: DocumentType;
    keyword?: string;
    entity?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    documents: DatabaseDocument[];
    total: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, documentType, keyword, entity, startDate, endDate } = params;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (documentType) {
        where.documentType = documentType;
      }

      if (keyword) {
        where.OR = [
          { title: { contains: keyword, mode: 'insensitive' } },
          { content: { contains: keyword, mode: 'insensitive' } },
          { fileName: { contains: keyword, mode: 'insensitive' } },
        ];
      }

      if (entity) {
        where.entities = {
          some: {
            name: { contains: entity, mode: 'insensitive' },
          },
        };
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where,
          include: {
            entities: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.document.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return { documents, total, totalPages };
    } catch (error) {
      logger.error('Failed to find documents:', error);
      throw new AppError('Failed to retrieve documents');
    }
  }

  /**
   * Update document
   */
  async update(
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
      const updateData: any = {};

      if (data.title) updateData.title = data.title;
      if (data.content) updateData.content = data.content;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
      if (data.documentType) updateData.documentType = data.documentType;

      // Handle entity updates
      if (data.entities) {
        // Disconnect all existing entities
        await prisma.document.update({
          where: { id },
          data: {
            entities: {
              set: [],
            },
          },
        });

        // Process new entities
        const entityConnections = await Promise.all(
          data.entities.map(async (entity) => {
            const existingEntity = await prisma.entity.findFirst({
              where: {
                name: entity.name,
                type: entity.type,
              },
            });

            if (existingEntity) {
              return { id: existingEntity.id };
            }

            const newEntity = await prisma.entity.create({
              data: {
                name: entity.name,
                type: entity.type,
                date: entity.date,
              },
            });

            return { id: newEntity.id };
          })
        );

        updateData.entities = {
          connect: entityConnections,
        };
      }

      const document = await prisma.document.update({
        where: { id },
        data: updateData,
        include: {
          entities: true,
        },
      });

      logger.info(`Document updated: ${document.id}`);
      return document;
    } catch (error) {
      logger.error(`Failed to update document ${id}:`, error);
      throw new AppError('Failed to update document');
    }
  }

  /**
   * Delete document
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.document.delete({
        where: { id },
      });

      logger.info(`Document deleted: ${id}`);
    } catch (error) {
      logger.error(`Failed to delete document ${id}:`, error);
      throw new AppError('Failed to delete document');
    }
  }

  /**
   * Search documents
   */
  async search(query: string, page = 1, limit = 10): Promise<{
    documents: DatabaseDocument[];
    total: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const where : any = {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { fileName: { contains: query, mode: 'insensitive' } },
          {
            entities: {
              some: {
                name: { contains: query, mode: 'insensitive' },
              },
            },
          },
        ],
      };

      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where,
          include: {
            entities: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.document.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return { documents, total, totalPages };
    } catch (error) {
      logger.error('Failed to search documents:', error);
      throw new AppError('Failed to search documents');
    }
  }

  /**
   * Get documents by entity
   */
  async findByEntity(entityId: string, page = 1, limit = 10): Promise<{
    documents: DatabaseDocument[];
    total: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const where = {
        entities: {
          some: {
            id: entityId,
          },
        },
      };

      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where,
          include: {
            entities: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.document.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return { documents, total, totalPages };
    } catch (error) {
      logger.error(`Failed to find documents by entity ${entityId}:`, error);
      throw new AppError('Failed to find documents by entity');
    }
  }
}