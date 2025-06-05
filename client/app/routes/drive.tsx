import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Layout } from '../components/Layout';
import { FileList } from '../components/FileList';
import { SearchBar } from '../components/SearchBar';
import { useStorage } from '../hooks/useStorage';

export default function Drive() {
  const { files, loading, error, getFiles, searchFiles } = useStorage();
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderHistory, setFolderHistory] = useState<Array<{ id: string | undefined; name: string }>>([
    { id: undefined, name: 'Root' }
  ]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    getFiles(currentFolderId);
  }, [currentFolderId]);

  const handleFolderClick = (folderId: string) => {
    const folderName = files.find(f => f.id === folderId)?.name || 'Unknown';
    setCurrentFolderId(folderId);
    setFolderHistory(prev => [...prev, { id: folderId, name: folderName }]);
    setIsSearching(false);
  };

  const handleBreadcrumbClick = (index: number) => {
    const targetFolder = folderHistory[index];
    setCurrentFolderId(targetFolder.id);
    setFolderHistory(prev => prev.slice(0, index + 1));
    setIsSearching(false);
  };

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      setIsSearching(true);
      await searchFiles(query, currentFolderId);
    } else {
      setIsSearching(false);
      await getFiles(currentFolderId);
    }
  };

  const handleRefresh = () => {
    if (isSearching) {
      setIsSearching(false);
    }
    getFiles(currentFolderId);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Google Drive Files</h1>
            <p className="text-gray-600">Browse and analyze files from your Google Drive</p>
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
                  Showing search results. <button onClick={() => handleSearch('')} className="underline">Clear search</button> to view all files.
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
      </div>
    </Layout>
  );
} 