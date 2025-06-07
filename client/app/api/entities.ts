import { api } from '../lib/api';
import type { ApiResponse, Entity, EntitySearchResult } from '../lib/types';

export interface EntityFilters {
  page?: number;
  limit?: number;
  type?: string;
  name?: string;
}

// Backend response structure for entities
interface EntitiesApiResponse {
  success: boolean;
  data: Entity[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export const entitiesApi = {
  // Get all entities with filters and pagination
  async getEntities(filters: EntityFilters = {}): Promise<EntitySearchResult> {
    console.log('getEntities', filters); 
    const response = await api.get<EntitiesApiResponse>('/entities', { params: filters });
    console.log('getEntities response', response.data);
    console.log('getEntities entities with counts:', response.data.data.map(entity => ({ name: entity.name, count: entity._count?.documents || 0 })));
    
    return {
      entities: response.data.data || [],
      total: response.data.pagination?.total || 0,
      page: response.data.pagination?.page || filters.page || 1,
      limit: response.data.pagination?.limit || filters.limit || 20
    };
  },

  // Get entity by ID
  async getEntity(id: string): Promise<Entity> {
    const response = await api.get<ApiResponse<Entity>>(`/entities/${id}`);
    return response.data.data;
  },

  // Search entities
  async searchEntities(query: string, page = 1, limit = 20): Promise<EntitySearchResult> {
    const params = { q: query, page, limit };
    const response = await api.get<EntitiesApiResponse>('/entities/search', { params });
    console.log('searchEntities response', response.data);
    
    return {
      entities: response.data.data || [],
      total: response.data.pagination?.total || 0,
      page: response.data.pagination?.page || page,
      limit: response.data.pagination?.limit || limit
    };
  },

  // Get entities by type
  async getEntitiesByType(type: string, page = 1, limit = 20): Promise<EntitySearchResult> {
    const params = { type, page, limit };
    const response = await api.get<EntitiesApiResponse>('/entities', { params });
    console.log('getEntitiesByType response', response.data);
    
    return {
      entities: response.data.data || [],
      total: response.data.pagination?.total || 0,
      page: response.data.pagination?.page || page,
      limit: response.data.pagination?.limit || limit
    };
  },

  // Update entity
  async updateEntity(id: string, data: Partial<Entity>): Promise<Entity> {
    const response = await api.put<ApiResponse<Entity>>(`/entities/${id}`, data);
    return response.data.data;
  },

  // Delete entity
  async deleteEntity(id: string): Promise<void> {
    await api.delete(`/entities/${id}`);
  },

  // Get entity statistics
  async getEntityStats(): Promise<Record<string, number>> {
    const response = await api.get<ApiResponse<Record<string, number>>>('/entities/stats');
    return response.data.data;
  },
}; 