import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { User, MapPin, Building, Calendar, Hash, FileText, ArrowLeft, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Layout } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import { useEntity } from '../hooks/useEntities';
import { useDocumentsByEntity } from '../hooks/useDocuments';
import type { Document, EntityType } from '../lib/types';

export default function EntityDetail() {
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    documentType: '',
    sortBy: 'createdAt',
    limit: 12
  });

  // Get entity details
  const entityQuery = useEntity(id);
  const entity = entityQuery.data;

  // Get entity's documents
  const documentsQuery = useDocumentsByEntity(id!, currentPage, filters.limit);
  const documents = documentsQuery.data?.documents || [];
  const totalDocuments = documentsQuery.data?.total || 0;
  const totalPages = Math.ceil(totalDocuments / filters.limit);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'person':
        return <User className="w-6 h-6" />;
      case 'location':
        return <MapPin className="w-6 h-6" />;
      case 'organization':
        return <Building className="w-6 h-6" />;
      case 'date':
        return <Calendar className="w-6 h-6" />;
      case 'event':
        return <Hash className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const documentTypes = [
    'letter', 'report', 'photo', 'newspaper', 'list', 
    'diary_entry', 'book', 'map', 'biography'
  ];

  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (entityQuery.isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (entityQuery.error || !entity) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium">Entity not found</div>
            <p className="text-gray-600 mt-2">The entity you're looking for doesn't exist</p>
            <Link 
              to="/entities"
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Entities
            </Link>
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
          <div className="flex items-center space-x-4">
            <Link 
              to="/entities"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${getEntityColor(entity.type)}`}>
                  {getEntityIcon(entity.type)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{entity.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="capitalize">{entity.type}</span>
                    {entity.date && (
                      <>
                        <span>•</span>
                        <span>{entity.date}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{totalDocuments} document{totalDocuments !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Related Documents</h2>
            <div className="text-sm text-gray-600">
              {totalDocuments} document{totalDocuments !== 1 ? 's' : ''} found
              {totalPages > 1 && (
                <span className="ml-2">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Search documents..."
              />
            </div>
            
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
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {documentsQuery.isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-6 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="ml-3 flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Documents Grid */}
          {!documentsQuery.isLoading && filteredDocuments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document: Document) => (
                <Link
                  key={document.id}
                  to={`/documents/${document.id}`}
                  className="block bg-gray-50 border border-gray-200 rounded-lg p-6 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {document.title}
                      </h3>
                      <p className="text-xs text-gray-500 capitalize">
                        {document.documentType.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {document.content.substring(0, 150)}
                    {document.content.length > 150 && '...'}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{formatDate(document.createdAt)}</span>
                    <span>{document.entities.length} entities</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!documentsQuery.isLoading && filteredDocuments.length === 0 && documents.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <FileText className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This entity doesn't appear in any documents yet.
                </p>
              </div>
            </div>
          )}

          {/* No Search Results */}
          {!documentsQuery.isLoading && filteredDocuments.length === 0 && documents.length > 0 && searchQuery && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <FileText className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No documents match your search for "{searchQuery}"
                </p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 rounded-b-lg mt-6">
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
                      {Math.min((currentPage - 1) * filters.limit + 1, totalDocuments)}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * filters.limit, totalDocuments)}
                    </span>{' '}
                    of <span className="font-medium">{totalDocuments}</span> documents
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
      </div>
    </Layout>
  );
} 