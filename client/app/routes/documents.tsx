import { useState } from 'react';
import { Link } from 'react-router';
import { FileText, User, MapPin, Building, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import { useDocuments, useDocumentSearch } from '../hooks/useDocuments';
import type { Document, DocumentType, EntityType } from '../lib/types';

export default function Documents() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    documentType: '',
    sortBy: 'createdAt',
    page: 1,
    limit: 12
  });

  // Use React Query hooks
  const documentsQuery = useDocuments({
    ...filters,
    page: currentPage,
  });

  const searchQuery_enabled = isSearching && searchQuery.trim().length >= 2;
  const searchResults = useDocumentSearch(
    searchQuery, 
    currentPage, 
    filters.limit
  );

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
  const activeQuery = isSearching && searchQuery_enabled ? searchResults : documentsQuery;
  const displayDocuments = activeQuery.data?.documents || [];
  const displayTotal = activeQuery.data?.total || 0;
  const totalPages = Math.ceil(displayTotal / filters.limit);
  const loading = activeQuery.isLoading;
  const error = activeQuery.error;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'person':
        return <User className="w-3 h-3" />;
      case 'location':
        return <MapPin className="w-3 h-3" />;
      case 'organization':
        return <Building className="w-3 h-3" />;
      case 'date':
        return <Calendar className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const getEntityColor = (type: EntityType) => {
    switch (type) {
      case 'person':
        return 'bg-blue-100 text-blue-800';
      case 'location':
        return 'bg-green-100 text-green-800';
      case 'organization':
        return 'bg-purple-100 text-purple-800';
      case 'date':
        return 'bg-orange-100 text-orange-800';
      case 'event':
        return 'bg-red-100 text-red-800';
      case 'unit':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const documentTypes: DocumentType[] = [
    'letter', 'report', 'photo', 'newspaper', 'list', 
    'diary_entry', 'book', 'map', 'biography'
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600">
              {displayTotal} document{displayTotal !== 1 ? 's' : ''} in your archive
              {totalPages > 1 && (
                <span className="ml-2 text-sm">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search documents by title, content, or entities..."
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={filters.documentType}
                onChange={(e) => handleFilterChange('documentType', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer min-w-[140px]"
              >
                <option value="">All Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type} className="capitalize text-gray-900">
                    {type.replace('_', ' ')}
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
                <option value="createdAt" className="text-gray-900">Newest First</option>
                <option value="title" className="text-gray-900">Title A-Z</option>
                <option value="documentType" className="text-gray-900">Type</option>
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
                <option value={6} className="text-gray-900">6 per page</option>
                <option value={12} className="text-gray-900">12 per page</option>
                <option value={24} className="text-gray-900">24 per page</option>
                <option value={48} className="text-gray-900">48 per page</option>
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
                  Showing search results for "{searchQuery}" ({displayTotal} found). 
                  <button onClick={() => handleSearch('')} className="underline ml-1">Clear search</button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error instanceof Error ? error.message : 'An error occurred'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading documents...</span>
          </div>
        ) : displayDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {isSearching ? 'No documents found matching your search' : 'No documents in your archive yet'}
            </p>
            {!isSearching && (
              <Link
                to="/drive"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Drive
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayDocuments.map((document) => (
                <Link
                  key={document.id}
                  to={`/documents/${document.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 p-6 block"
                >
                  <div className="space-y-3">
                    {/* Document Header */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {document.title}
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize ml-2 flex-shrink-0">
                        {document.documentType.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Content Preview */}
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {document.content}
                    </p>

                    {/* Entities */}
                    {document.entities && document.entities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {document.entities.slice(0, 3).map((entity, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEntityColor(entity.type)}`}
                          >
                            {getEntityIcon(entity.type)}
                            <span className="ml-1 truncate max-w-20">{entity.name}</span>
                          </span>
                        ))}
                        {document.entities.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            +{document.entities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <span>{formatDate(document.createdAt)}</span>
                      <span>{document.fileName}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
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
                      <span className="font-medium">{((currentPage - 1) * filters.limit) + 1}</span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * filters.limit, displayTotal)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{displayTotal}</span>{' '}
                      results
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
                      
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 7) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 4) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 3) {
                          pageNumber = totalPages - 6 + i;
                        } else {
                          pageNumber = currentPage - 3 + i;
                        }
                        
                        if (pageNumber < 1 || pageNumber > totalPages) return null;
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              pageNumber === currentPage
                                ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                            }`}
                          >
                            {pageNumber}
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
          </>
        )}
      </div>
    </Layout>
  );
} 