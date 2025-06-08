import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Brain, FileText, Loader2, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Eye, Download, FileIcon } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useFileMetadata } from '../hooks/useStorage';
import { useDocumentAnalysis, useDocumentProcessor } from '../hooks/useDocuments';
import { isImageFile } from '../lib/utils';

export default function Analyze() {
  const [searchParams] = useSearchParams();
  const fileId = searchParams.get('fileId');
  const fileName = searchParams.get('fileName');
  
  const [showAnalysis, setShowAnalysis] = useState(false);

  // React Query hooks
  const { data: metadata, isLoading: loadingMetadata, error: metadataError } = useFileMetadata(fileId || undefined);
  const analysisMutation = useDocumentAnalysis();
  const processorMutation = useDocumentProcessor();

  const handleAnalyze = async () => {
    if (!fileId) return;
    
    try {
      const result = await analysisMutation.mutateAsync(fileId);
      setShowAnalysis(true);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  const handleSaveDocument = async () => {
    if (!fileId) return;
    
    try {
      await processorMutation.mutateAsync(fileId);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const isWordDocument = metadata?.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const isPdfDocument = metadata?.mimeType === 'application/pdf';
  const isImageDocument = metadata && isImageFile(metadata.name, metadata.mimeType);

  const getFileIcon = () => {
    if (isWordDocument) return '📄';
    if (isPdfDocument) return '📋';
    if (isImageDocument) return '🖼️';
    return '📄';
  };

  const getDocumentTypeLabel = () => {
    if (isWordDocument) return 'Word Document';
    if (isPdfDocument) return 'PDF Document';
    if (isImageDocument) return 'Image File';
    return 'Document';
  };

  if (!fileId || !fileName) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Missing File Information</h1>
          <p className="text-gray-600">
            Please select a file from the Drive page to analyze.
          </p>
          <Link
            to="/drive"
            className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Drive
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/drive"
                className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon()}</span>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Document Analysis</h1>
                    <p className="text-gray-600 mt-1">
                      {getDocumentTypeLabel()}: <span className="font-medium text-gray-900">{fileName}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {metadata && (
                <a
                  href={`https://drive.google.com/file/d/${fileId}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Original
                </a>
              )}
              <button
                onClick={handleAnalyze}
                disabled={analysisMutation.isPending}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {analysisMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Start AI Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* File Information Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileIcon className="w-5 h-5 mr-2 text-gray-600" />
            File Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Preview Section */}
            <div className="lg:col-span-1">
              {isImageDocument && metadata ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </h4>
                  <div className="aspect-square w-full bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                    <img
                      src={`https://drive.google.com/thumbnail?id=${fileId}&sz=w400`}
                      alt={fileName || 'File preview'}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <FileText className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">Preview not available</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Document Type</h4>
                  <div className="aspect-square w-full bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">{getFileIcon()}</span>
                      <p className="text-sm font-medium text-gray-700">{getDocumentTypeLabel()}</p>
                      {isWordDocument && (
                        <p className="text-xs text-gray-500 mt-1">Microsoft Word</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="lg:col-span-3">
              {loadingMetadata ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Loading file information...</span>
                </div>
              ) : metadataError ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-sm text-red-700">
                    Failed to load metadata: {metadataError instanceof Error ? metadataError.message : 'Unknown error'}
                  </div>
                </div>
              ) : metadata ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">File Name</span>
                      <p className="text-sm text-gray-900 mt-1 break-words bg-gray-50 p-2 rounded">{metadata.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">File Size</span>
                      <p className="text-sm text-gray-900 mt-1">
                        {metadata.size ? `${Math.round(parseInt(metadata.size) / 1024)} KB` : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">File Type</span>
                      <p className="text-sm text-gray-900 mt-1">{getDocumentTypeLabel()}</p>
                      <p className="text-xs text-gray-500">{metadata.mimeType || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Last Modified</span>
                      <p className="text-sm text-gray-900 mt-1">
                        {metadata.modifiedTime ? new Date(metadata.modifiedTime).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No metadata available</p>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Error */}
        {analysisMutation.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Analysis Failed</h3>
                <p className="text-sm text-red-700 mt-1">
                  {analysisMutation.error instanceof Error ? analysisMutation.error.message : 'Unknown error occurred during analysis'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisMutation.data && showAnalysis && (
          <div className="space-y-6">
            {/* Document Classification */}
            {analysisMutation.data.analysis.documentType && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Classification</h2>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                    {analysisMutation.data.analysis.documentType.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-600">Automatically detected document type</span>
                </div>
              </div>
            )}

            {/* Extracted Entities */}
            {analysisMutation.data.analysis.entities && analysisMutation.data.analysis.entities.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Extracted Information ({analysisMutation.data.analysis.entities.length} items found)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {analysisMutation.data.analysis.entities.map((entity: { name: string; type: string }, index: number) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {entity.name}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shrink-0 ml-2 ${
                          entity.type === 'person' ? 'bg-blue-100 text-blue-800' :
                          entity.type === 'location' ? 'bg-green-100 text-green-800' :
                          entity.type === 'organization' ? 'bg-purple-100 text-purple-800' :
                          entity.type === 'date' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {entity.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Text */}
            {analysisMutation.data.analysis.content && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Extracted Text Content</h2>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto border">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                    {analysisMutation.data.analysis.content}
                  </pre>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Text extracted using AI-powered OCR and document processing
                </p>
              </div>
            )}
          </div>
        )}

        {/* Save Document Section */}
        {analysisMutation.data && showAnalysis && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Save to Document Archive
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Add this analyzed document to your searchable archive for future reference
                </p>
              </div>
              <button
                onClick={handleSaveDocument}
                disabled={processorMutation.isPending || processorMutation.isSuccess}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {processorMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : processorMutation.isSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Saved Successfully
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Save to Archive
                  </>
                )}
              </button>
            </div>

            {processorMutation.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  <div className="text-sm text-red-700">
                    Save failed: {processorMutation.error instanceof Error ? processorMutation.error.message : 'Unknown error'}
                  </div>
                </div>
              </div>
            )}

            {processorMutation.isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <div className="text-sm text-green-700">
                      Document successfully saved to your archive! You can now search for it in the Documents section.
                    </div>
                  </div>
                  <Link
                    to="/documents"
                    className="text-sm text-green-700 hover:text-green-800 font-medium underline"
                  >
                    View Archive
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
} 