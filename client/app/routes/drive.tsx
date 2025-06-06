import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '../components/Layout';
import { FileList } from '../components/FileList';
import { SearchBar } from '../components/SearchBar';
import { useStorage } from '../hooks/useStorage';

export default function Drive() {
  const { files, total, loading, error, getFiles, searchFiles } = useStorage();
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderHistory, setFolderHistory] = useState<Array<{ id: string | undefined; name: string }>>([
    { id: undefined, name: 'Root' }
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    getFiles(currentFolderId, 1, pageSize);
    setCurrentPage(1);
  }, [currentFolderId, pageSize]);

  const handleFolderClick = (folderId: string) => {
    const folderName = files.find(f => f.id === folderId)?.name || 'Unknown';
    setCurrentFolderId(folderId);
    setFolderHistory(prev => [...prev, { id: folderId, name: folderName }]);
    setIsSearching(false);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleBreadcrumbClick = (index: number) => {
    const targetFolder = folderHistory[index];
    setCurrentFolderId(targetFolder.id);
    setFolderHistory(prev => prev.slice(0, index + 1));
    setIsSearching(false);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      setCurrentPage(1);
      await searchFiles(query, currentFolderId, 1, pageSize);
    } else {
      setIsSearching(false);
      setCurrentPage(1);
      await getFiles(currentFolderId, 1, pageSize);
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    
    if (isSearching && searchQuery) {
      await searchFiles(searchQuery, currentFolderId, page, pageSize);
    } else {
      await getFiles(currentFolderId, page, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    if (isSearching) {
      setIsSearching(false);
      setSearchQuery('');
    }
    setCurrentPage(1);
    getFiles(currentFolderId, 1, pageSize);
  };

  const totalPages = Math.ceil((total || 0) / pageSize);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Google Drive Files</h1>
            <p className="text-gray-600">
              Browse and analyze files from your Google Drive
              {total !== undefined && (
                <span className="ml-2">
                  ({total} file{total !== 1 ? 's' : ''}{totalPages > 1 && `, page ${currentPage} of ${totalPages}`})
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm text-gray-600">Show:</label>
              <div className="relative">
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer min-w-[80px]"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {folderHistory.length > 1 && (
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              {folderHistory.map((folder, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-gray-400 mx-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className={`text-sm font-medium ${
                      index === folderHistory.length - 1
                        ? 'text-gray-500 cursor-default'
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                    disabled={index === folderHistory.length - 1}
                  >
                    {folder.name}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search files in current folder..."
          className="max-w-md"
        />

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
                  Showing search results for "{searchQuery}". 
                  <button onClick={() => handleSearch('')} className="underline ml-1">Clear search</button> to view all files.
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
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        <FileList
          files={files}
          onFolderClick={handleFolderClick}
          loading={loading}
        />

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
                    {Math.min(currentPage * pageSize, total || 0)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{total || 0}</span>{' '}
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
      </div>
    </Layout>
  );
} 