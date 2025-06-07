import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entitiesApi, type EntityFilters } from '../api/entities';
import type { Entity, EntitySearchResult } from '../lib/types';

// Query Keys
export const entityKeys = {
  all: ['entities'] as const,
  lists: () => [...entityKeys.all, 'list'] as const,
  list: (filters: EntityFilters) => [...entityKeys.lists(), filters] as const,
  details: () => [...entityKeys.all, 'detail'] as const,
  detail: (id: string) => [...entityKeys.details(), id] as const,
  search: (query: string, page: number, limit: number) => [...entityKeys.all, 'search', query, page, limit] as const,
  stats: () => [...entityKeys.all, 'stats'] as const,
  byType: (type: string, page: number, limit: number) => [...entityKeys.all, 'type', type, page, limit] as const,
};

// Entities List Hook
export function useEntities(filters: EntityFilters = {}) {
  return useQuery({
    queryKey: entityKeys.list(filters),
    queryFn: () => entitiesApi.getEntities(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Single Entity Hook
export function useEntity(id?: string) {
  return useQuery({
    queryKey: entityKeys.detail(id!),
    queryFn: () => entitiesApi.getEntity(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Entity Search Hook
export function useEntitySearch(query: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: entityKeys.search(query, page, limit),
    queryFn: () => entitiesApi.searchEntities(query, page, limit),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Entities by Type Hook
export function useEntitiesByType(type: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: entityKeys.byType(type, page, limit),
    queryFn: () => entitiesApi.getEntitiesByType(type, page, limit),
    enabled: !!type,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Entity Stats Hook
export function useEntityStats() {
  return useQuery({
    queryKey: entityKeys.stats(),
    queryFn: () => entitiesApi.getEntityStats(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Entity Update Hook (Mutation)
export function useUpdateEntity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Entity> }) => 
      entitiesApi.updateEntity(id, data),
    onSuccess: (updatedEntity) => {
      // Update the entity in the cache
      queryClient.setQueryData(
        entityKeys.detail(updatedEntity.id),
        updatedEntity
      );
      // Invalidate lists to ensure they're up to date
      queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
    },
  });
}

// Entity Delete Hook (Mutation)
export function useDeleteEntity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => entitiesApi.deleteEntity(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: entityKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: entityKeys.stats() });
    },
  });
} 