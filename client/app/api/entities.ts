import { api } from '../lib/api';
import type { ApiResponse, Entity, SearchResult } from '../lib/types';

export interface EntityFilters {
  page?: number;
  limit?: number;
  type?: string;
  name?: string;
}

export const entitiesApi = {
  // Get all entities with filters and pagination
  async getEntities(filters: EntityFilters = {}): Promise<SearchResult> {
    console.log('getEntities', filters); 
    const response = await api.get<ApiResponse<SearchResult>>('/entities', { params: filters });
    console.log('getEntities response', response.data);
    return response.data.data;
  },

  // Get entity by ID
  async getEntity(id: string): Promise<Entity> {
    const response = await api.get<ApiResponse<Entity>>(`/entities/${id}`);
    return response.data.data;
  },

  // Search entities
  async searchEntities(query: string, page = 1, limit = 20): Promise<SearchResult> {
    const params = { q: query, page, limit };
    const response = await api.get<ApiResponse<SearchResult>>('/entities/search', { params });
    return response.data.data;
  },

  // Get entities by type
  async getEntitiesByType(type: string, page = 1, limit = 20): Promise<SearchResult> {
    const params = { type, page, limit };
    const response = await api.get<ApiResponse<SearchResult>>('/entities', { params });
    return response.data.data;
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