import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { 
  ArrowLeft, 
  Brain, 
  Save, 
  FileText, 
  User, 
  MapPin, 
  Building, 
  Calendar,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { ImagePreview } from '../components/ImagePreview';
import { useFileMetadata } from '../hooks/useStorage';
import { useDocumentAnalysis, useDocumentProcessor } from '../hooks/useDocuments';
import { formatFileSize, formatDate, formatMimeType } from '../lib/utils';
import type { EntityType } from '../lib/types';

export default function Analyze() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { metadata, loading: metadataLoading, error: metadataError } = useFileMetadata(fileId);
  const { analysis, loading: analyzing, error: analysisError, analyzeDocument } = useDocumentAnalysis();
  const { processing, error: processingError, processAndSave } = useDocumentProcessor();
  const [savedDocumentId, setSavedDocumentId] = useState<string | null>(null);


  useEffect(() => {
    if (!fileId) {
      navigate('/drive');
    }
  }, [fileId, navigate]);

  const handleAnalyze = async () => {
    if (!fileId) return;
    try {
      await analyzeDocument(fileId);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleSave = async () => {
    if (!fileId) return;
    try {
      const document = await processAndSave(fileId);
      setSavedDocumentId(document.id);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'person':
        return <User className="w-4 h-4" />;
      case 'location':
        return <MapPin className="w-4 h-4" />;
      case 'organization':
        return <Building className="w-4 h-4" />;
      case 'date':
        return <Calendar className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
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

  if (!fileId) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            to="/drive"
            className="inline-flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Analysis</h1>
            <p className="text-gray-600">AI-powered document analysis and entity extraction</p>
          </div>
        </div>

        {/* File Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">File Information</h2>
          
          {metadataLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
              <span className="text-gray-600">Loading file information...</span>
            </div>
          )}
          
          {metadataError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Failed to load file information</h3>
                  <div className="mt-2 text-sm text-red-700">{metadataError}</div>
                </div>
              </div>
            </div>
          )}
          
          {metadata && !metadataLoading && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Name:</span>
                <div className="mt-1 break-words text-gray-900">{metadata.name}</div>
              </div>
              <div>
                <span className="font-medium text-gray-500">Type:</span>
                <div className="mt-1 text-gray-900">{formatMimeType(metadata.mimeType)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-500">Size:</span>
                <div className="mt-1 text-gray-900">{formatFileSize(metadata.size)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-500">Modified:</span>
                <div className="mt-1 text-gray-900">{formatDate(metadata.modifiedTime)}</div>
              </div>
            </div>
          )}
          
          {!metadata && !metadataLoading && !metadataError && (
            <div className="text-center py-8 text-gray-500">
              No file information available
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || processing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {analyzing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            {analyzing ? 'Analyzing...' : 'Analyze Document'}
          </button>

          {analysis && !savedDocumentId && (
            <button
              onClick={handleSave}
              disabled={processing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {processing ? 'Saving...' : 'Save to Database'}
            </button>
          )}

          {savedDocumentId && (
            <Link
              to={`/documents/${savedDocumentId}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Document
            </Link>
          )}
        </div>

        {/* Success Message */}
        {savedDocumentId && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Document saved successfully!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  The document has been processed and saved to your archive.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {(analysisError || processingError) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {analysisError || processingError}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Preview */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Preview</h2>
                <ImagePreview
                  src={analysis.image}
                  alt={`Preview of ${analysis.fileName}`}
                  className=""
                  containerClassName="w-full h-96 border border-gray-200 rounded-lg"
                />
              </div>

              {/* Document Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Analysis Results</h2>
                
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-500">Title:</span>
                    <div className="mt-1 text-lg font-medium text-gray-900">{analysis.analysis.title}</div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-500">Document Type:</span>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {analysis.analysis.documentType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-500">Content Summary:</span>
                    <div className="mt-1 text-gray-900">{analysis.analysis.content}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Extracted Entities */}
            {analysis.analysis.entities && analysis.analysis.entities.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Extracted Entities ({analysis.analysis.entities.length})
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysis.analysis.entities.map((entity, index) => (
                    <div
                      key={index}
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${getEntityColor(entity.type)}`}
                    >
                      {getEntityIcon(entity.type)}
                      <span className="ml-2 truncate">{entity.name}</span>
                      <span className="ml-2 text-xs opacity-75 capitalize">
                        {entity.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
} 