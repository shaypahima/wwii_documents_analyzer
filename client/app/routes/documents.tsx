import { useState } from 'react';
import { Link } from 'react-router';
import { FileText, User, MapPin, Building, Calendar, Filter, ChevronLeft, ChevronRight, Grid, List, ArrowUpDown, Clock, Eye, Trash2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useDocuments, useDocumentSearch, useDeleteDocument } from '../hooks/useDocuments';
import type { Document, DocumentType, EntityType } from '../lib/types';

export default function Documents() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    documentType: '',
    sortBy: 'createdAt',
    page: 1,
    limit: 12,
    contentType: 'documents',
    dateRange: '',
  });

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    document: Document | null;
  }>({
    isOpen: false,
    document: null,
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

  // Delete mutation
  const deleteMutation = useDeleteDocument();

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

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    setCurrentPage(1);
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (document: Document, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      document,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.document) {
      try {
        await deleteMutation.mutateAsync(deleteConfirm.document.id);
        setDeleteConfirm({ isOpen: false, document: null });
      } catch (error) {
        console.error('Delete failed:', error);
        // Error handling is managed by React Query
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, document: null });
  };

  // Determine which data to display
  const activeQuery = isSearching && searchQuery_enabled ? searchResults : documentsQuery;
  const displayDocuments = activeQuery.data?.documents || [];
  const displayTotal = activeQuery.data?.total || 0;
  const totalPages = Math.ceil(displayTotal / filters.limit);
  const loading = activeQuery.isLoading;
  const error = activeQuery.error;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const DocumentCard = ({ document }: { document: Document }) => (
    <Link
      to={`/documents/${document.id}`}
      className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {document.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(document.createdAt)}
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize shrink-0 ml-3">
            {document.documentType.replace('_', ' ')}
          </span>
        </div>

        {/* Content Preview */}
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
          {document.content}
        </p>

        {/* Entities */}
        {document.entities && document.entities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Extracted Entities
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {document.entities.slice(0, 6).map((entity, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEntityColor(entity.type)}`}
                >
                  {getEntityIcon(entity.type)}
                  <span className="ml-1 truncate max-w-20">{entity.name}</span>
                </span>
              ))}
              {document.entities.length > 6 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{document.entities.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 truncate">{document.fileName}</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => handleDeleteClick(document, e)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete document"
              type="button"
            >
              <Trash2 className="h-3 w-3" />
            </button>
            <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const DocumentListItem = ({ document }: { document: Document }) => (
    <Link
      to={`/documents/${document.id}`}
      className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 p-6"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {document.title}
              </h3>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(document.createdAt)}
                <span className="mx-2">•</span>
                <span className="capitalize">{document.documentType.replace('_', ' ')}</span>
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
                             <button
                 onClick={(e) => handleDeleteClick(document, e)}
                 className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                 title="Delete document"
                 type="button"
               >
                 <Trash2 className="h-4 w-4" />
               </button>
              <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                <Eye className="h-3 w-3 mr-1" />
                View
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {document.content}
          </p>
          
          {document.entities && document.entities.length > 0 && (
            <div className="flex items-center space-x-2 pt-2">
              <span className="text-xs text-gray-500">Entities:</span>
              <div className="flex flex-wrap gap-1">
                {document.entities.slice(0, 4).map((entity, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getEntityColor(entity.type)}`}
                  >
                    {entity.name}
                  </span>
                ))}
                {document.entities.length > 4 && (
                  <span className="text-xs text-gray-500">+{document.entities.length - 4} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documents Archive</h1>
              <p className="text-gray-600 mt-1">
                {displayTotal.toLocaleString()} document{displayTotal !== 1 ? 's' : ''} in the collection
                {isSearching && searchQuery && (
                  <span className="ml-2 text-blue-600">
                    matching "{searchQuery}"
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search documents by title, content, or entities..."
              showFilters={true}
              filters={filters}
              onFilterChange={handleFilterChange}
              className="max-w-2xl"
              size="lg"
            />

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="documentType">By Type</option>
                </select>
              </div>

              <select
                value={filters.documentType}
                onChange={(e) => handleFilterChange({ documentType: e.target.value })}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Document Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type} className="capitalize">
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>

              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value={6}>6 per page</option>
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 font-medium">Loading documents...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-red-800">Error loading documents</h3>
              <p className="text-red-600">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : displayDocuments.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="h-24 w-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {isSearching ? 'No documents found' : 'No documents yet'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {isSearching 
                  ? `We couldn't find any documents matching "${searchQuery}". Try adjusting your search terms or filters.`
                  : 'Start by uploading and analyzing documents to build your archive.'
                }
              </p>
            </div>
            {!isSearching && (
              <Link
                to="/drive"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Browse Drive to Get Started
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Documents Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayDocuments.map((document) => (
                  <DocumentCard key={document.id} document={document} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {displayDocuments.map((document) => (
                  <DocumentListItem key={document.id} document={document} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages} ({displayTotal.toLocaleString()} total results)
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Document"
          message={`Are you sure you want to delete "${deleteConfirm.document?.title || 'this document'}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </Layout>
  );
} 