import { useState } from 'react';
import { Link } from 'react-router';
import { 
  FileText, 
  Folder, 
  Download, 
  Eye, 
  Brain,
  Calendar,
  User,
  Loader2
} from 'lucide-react';
import type { FileListItem } from '../lib/types';
import { useFileDownload } from '../hooks/useStorage';
import { formatFileSize, formatDate } from '../lib/utils';

interface FileListProps {
  files: FileListItem[];
  onFolderClick?: (folderId: string) => void;
  loading?: boolean;
}

export function FileList({ files, onFolderClick, loading }: FileListProps) {
  const { downloadFile, downloading } = useFileDownload();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (file: FileListItem) => {
    setDownloadingId(file.id);
    try {
      await downloadFile(file.id, file.name);
    } finally {
      setDownloadingId(null);
    }
  };



  const getFileIcon = (file: FileListItem) => {
    if (file.isFolder || file.type === 'folder') {
      return <Folder className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading files...</span>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No files found</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {files.map((file) => (
          <li key={file.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                {getFileIcon(file)}
                <div className="ml-3 min-w-0 flex-1">
                  <div className="flex items-center">
                    {(file.isFolder || file.type === 'folder') ? (
                      <button
                        onClick={() => onFolderClick?.(file.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate"
                      >
                        {file.name}
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(file.modifiedTime)}
                    </span>
                    {!(file.isFolder || file.type === 'folder') && (
                      <span>{formatFileSize(file.size)}</span>
                    )}
                    <span className="capitalize">{file.type}</span>
                  </div>
                </div>
              </div>

              {!(file.isFolder || file.type === 'folder') && (
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to={`/analyze/${file.id}`}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    Analyze
                  </Link>
                  
                  <button
                    onClick={() => handleDownload(file)}
                    disabled={downloadingId === file.id}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {downloadingId === file.id ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3 mr-1" />
                    )}
                    Download
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 