import { useState } from 'react';
import { Link } from 'react-router';
import { FileText, User, MapPin, Building, Calendar, Filter } from 'lucide-react';
import { Layout } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import { useDocuments, useDocumentSearch } from '../hooks/useDocuments';
import type { Document, DocumentType, EntityType } from '../lib/types';

export default function Documents() {
  const { documents, total, loading, fetchDocuments } = useDocuments();
  const { results, loading: searching, searchDocuments } = useDocumentSearch();
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    documentType: '',
    sortBy: 'createdAt'
  });

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      setIsSearching(true);
      await searchDocuments(query);
    } else {
      setIsSearching(false);
      fetchDocuments();
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchDocuments(newFilters);
  };

  const displayDocuments = isSearching ? (results?.documents || []) : (documents || []);
  const displayTotal = isSearching ? (results?.total || 0) : total;

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
          <div className="flex gap-2">
            <select
              value={filters.documentType}
              onChange={(e) => handleFilterChange('documentType', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Types</option>
              {documentTypes.map(type => (
                <option key={type} value={type} className="capitalize">
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="createdAt">Newest First</option>
              <option value="title">Title A-Z</option>
              <option value="documentType">Type</option>
            </select>
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
                  Showing search results ({displayTotal} found). 
                  <button onClick={() => handleSearch('')} className="underline ml-1">Clear search</button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Documents Grid */}
        {loading || searching ? (
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
        )}
      </div>
    </Layout>
  );
} 