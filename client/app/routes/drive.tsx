import { useState } from 'react';
import { FileText, Folder, Download, ChevronLeft, ChevronRight, Home, Search, Brain } from 'lucide-react';
import { Link } from 'react-router';
import { Layout } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import { useStorage, useStorageSearch, useFileDownload } from '../hooks/useStorage';
import { formatFileSize, getFileIcon, isImageFile } from '../lib/utils';
import type { FileListItem } from '../lib/types';

interface BreadcrumbItem {
  id: string;
  name: string;
}

export default function Drive() {
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // React Query hooks
  const storageQuery = useStorage(currentFolderId, currentPage, pageSize);
  const searchResults = useStorageSearch(
    searchQuery, 
    currentFolderId, 
    currentPage, 
    pageSize
  );
  const downloadMutation = useFileDownload();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      setCurrentPage(1);
    } else {
      setIsSearching(false);
      setCurrentPage(1);
    }
  };

  const handleFolderClick = (folder: FileListItem) => {
    setCurrentFolderId(folder.id);
    setCurrentPage(1);
    setIsSearching(false);
    setSearchQuery('');
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Root folder
      setCurrentFolderId(undefined);
      setBreadcrumbs([]);
    } else {
      const targetBreadcrumb = breadcrumbs[index];
      setCurrentFolderId(targetBreadcrumb.id);
      setBreadcrumbs(prev => prev.slice(0, index + 1));
    }
    setCurrentPage(1);
      setIsSearching(false);
    setSearchQuery('');
  };

  const handleDownload = async (file: FileListItem) => {
    try {
      await downloadMutation.mutateAsync({
        fileId: file.id,
        fileName: file.name,
      });
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Determine which data to display
  const activeQuery = isSearching && searchQuery.trim().length >= 2 ? searchResults : storageQuery;
  const files = activeQuery.data?.files || [];
  const total = activeQuery.data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);
  const loading = activeQuery.isLoading;
  const error = activeQuery.error;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Drive</h1>
            <p className="text-gray-600">
              {total} item{total !== 1 ? 's' : ''}
              {totalPages > 1 && (
                <span className="ml-2 text-sm">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Breadcrumbs */}
          <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <button
                onClick={() => handleBreadcrumbClick(-1)}
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                <Home className="h-4 w-4" />
                <span className="ml-1">Root</span>
              </button>
            </li>
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.id} className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {crumb.name}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
        <SearchBar
          onSearch={handleSearch}
              placeholder="Search files and folders..."
            />
          </div>
          
          <div className="flex gap-3">
            {/* Page Size Selector */}
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer min-w-[140px]"
              >
                <option value={10} className="text-gray-900">10 per page</option>
                <option value={20} className="text-gray-900">20 per page</option>
                <option value={50} className="text-gray-900">50 per page</option>
                <option value={100} className="text-gray-900">100 per page</option>
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
                <Search className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Showing search results for "{searchQuery}" ({total} found). 
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

        {/* File List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading files...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {isSearching ? 'No files found matching your search' : 'This folder is empty'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            {(item.type === 'folder' || item.isFolder) ? (
                              <Folder className="h-8 w-8 text-blue-500" />
                            ) : (
                              getFileIcon(item.name, 'h-8 w-8')
                            )}
                          </div>
                          <div className="ml-4 min-w-0 max-w-xs">
                            {(item.type === 'folder' || item.isFolder) ? (
                              <button
                                onClick={() => handleFolderClick(item)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-900 truncate block w-full text-left"
                                title={item.name}
                              >
                                {item.name}
                              </button>
                            ) : (
                              <div 
                                className="text-sm font-medium text-gray-900 truncate"
                                title={item.name}
                              >
                                {item.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {(item.type === 'folder' || item.isFolder) ? 'Folder' : item.mimeType?.split('/')[0] || 'File'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(item.type === 'folder' || item.isFolder) ? '-' : formatFileSize(item.size || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.modifiedTime ? new Date(item.modifiedTime).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        {(item.type === 'file' || !item.isFolder) && (
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/analyze?fileId=${item.id}&fileName=${encodeURIComponent(item.name)}`}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
                              title="Analyze Document"
                            >
                              <Brain className="h-3 w-3 mr-1.5" />
                              Analyze
                            </Link>
                            <button
                              onClick={() => handleDownload(item)}
                              disabled={downloadMutation.isPending}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Download File"
                            >
                              <Download className="h-3 w-3 mr-1.5" />
                              Download
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {files.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {(item.type === 'folder' || item.isFolder) ? (
                          <Folder className="h-8 w-8 text-blue-500" />
                        ) : (
                          getFileIcon(item.name, 'h-8 w-8')
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        {(item.type === 'folder' || item.isFolder) ? (
                          <button
                            onClick={() => handleFolderClick(item)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-900 truncate block w-full text-left"
                            title={item.name}
                          >
                            {item.name}
                          </button>
                        ) : (
                          <div 
                            className="text-sm font-medium text-gray-900 truncate"
                            title={item.name}
                          >
                            {item.name}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {(item.type === 'folder' || item.isFolder) ? 'Folder' : 
                            `${item.mimeType?.split('/')[0] || 'File'} • ${formatFileSize(item.size || 0)}`}
                        </div>
                      </div>
                    </div>
                    {(item.type === 'file' || !item.isFolder) && (
                      <div className="flex items-center space-x-2 ml-2">
                        <Link
                          to={`/analyze?fileId=${item.id}&fileName=${encodeURIComponent(item.name)}`}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
                          title="Analyze Document"
                        >
                          <Brain className="h-3 w-3 mr-1" />
                          Analyze
                        </Link>
                        <button
                          onClick={() => handleDownload(item)}
                          disabled={downloadMutation.isPending}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Download File"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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
                      <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, total)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{total}</span>{' '}
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