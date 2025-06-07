import { useState } from 'react';
import { Link } from 'react-router';
import { User, MapPin, Building, Calendar, FileText, Filter, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import { Layout } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import { useEntities, useEntitySearch, useEntityStats } from '../hooks/useEntities';
import type { Entity, EntityType } from '../lib/types';

export default function Entities() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    sortBy: 'name',
    page: 1,
    limit: 24
  });

  // Use React Query hooks
  const entitiesQuery = useEntities({
    ...filters,
    page: currentPage,
  });

  const searchQuery_enabled = isSearching && searchQuery.trim().length >= 2;
  const searchResults = useEntitySearch(
    searchQuery, 
    currentPage, 
    filters.limit
  );

  const statsQuery = useEntityStats();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      setCurrentPage(1);
    } else {
      setIsSearching(false);
      setCurrentPage(1);
      setFilters(prev => ({ ...prev, page: 1 }));
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
  };

  // Determine which data to display
  const activeQuery = isSearching && searchQuery_enabled ? searchResults : entitiesQuery;
  const displayEntities = activeQuery.data?.entities || [];
  const displayTotal = activeQuery.data?.total || 0;
  const totalPages = Math.ceil(displayTotal / filters.limit);
  const loading = activeQuery.isLoading;
  const error = activeQuery.error;
  const entityStats = statsQuery.data || {};

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'person':
        return <User className="w-5 h-5" />;
      case 'location':
        return <MapPin className="w-5 h-5" />;
      case 'organization':
        return <Building className="w-5 h-5" />;
      case 'date':
        return <Calendar className="w-5 h-5" />;
      case 'event':
        return <Hash className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getEntityColor = (type: EntityType) => {
    switch (type) {
      case 'person':
        return 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100';
      case 'location':
        return 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100';
      case 'organization':
        return 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100';
      case 'date':
        return 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100';
      case 'event':
        return 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100';
      case 'unit':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100';
    }
  };

  const entityTypes: EntityType[] = [
    'person', 'location', 'organization', 'event', 'date', 'unit'
  ];

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium">Error loading entities</div>
            <p className="text-gray-600 mt-2">Please try again later</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Entities</h1>
            <p className="text-gray-600">
              {displayTotal} entit{displayTotal !== 1 ? 'ies' : 'y'} discovered from your documents
              {totalPages > 1 && (
                <span className="ml-2 text-sm">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {Object.keys(entityStats).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {entityTypes.map(type => (
              <div key={type} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${getEntityColor(type)}`}>
                    {getEntityIcon(type)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 capitalize">
                      {type === 'organization' ? 'Orgs' : type}s
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {entityStats[type] || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search entities by name..."
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer min-w-[140px]"
              >
                <option value="">All Types</option>
                {entityTypes.map(type => (
                  <option key={type} value={type} className="capitalize text-gray-900">
                    {type}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer min-w-[140px]"
              >
                <option value="name" className="text-gray-900">Name A-Z</option>
                <option value="type" className="text-gray-900">Type</option>
                <option value="documents" className="text-gray-900">Most Documents</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer min-w-[100px]"
              >
                <option value={12} className="text-gray-900">12 per page</option>
                <option value={24} className="text-gray-900">24 per page</option>
                <option value={48} className="text-gray-900">48 per page</option>
                <option value={96} className="text-gray-900">96 per page</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search Indicator */}
        {isSearching && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Showing search results for "<span className="font-medium">{searchQuery}</span>"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        )}

        {/* Entities Grid */}
        {!loading && displayEntities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {displayEntities.map((entity: Entity) => (
              <Link
                key={entity.id}
                to={`/entities/${entity.id}`}
                className={`block bg-white border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getEntityColor(entity.type)}`}
              >
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-lg bg-white bg-opacity-50`}>
                    {getEntityIcon(entity.type)}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {entity.name}
                    </h3>
                    <p className="text-xs text-gray-500 capitalize">
                      {entity.type}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    {entity._count?.documents || 0} document{entity._count?.documents !== 1 ? 's' : ''}
                  </span>
                  {entity.date && (
                    <span className="truncate ml-2">
                      {entity.date}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && displayEntities.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <FileText className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {isSearching ? 'No entities found' : 'No entities yet'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isSearching 
                  ? `No entities match your search for "${searchQuery}"`
                  : 'Upload and process documents to discover entities'
                }
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {Math.min((currentPage - 1) * filters.limit + 1, displayTotal)}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * filters.limit, displayTotal)}
                  </span>{' '}
                  of <span className="font-medium">{displayTotal}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          pageNum === currentPage
                            ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 