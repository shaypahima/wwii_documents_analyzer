import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, FileText, User, MapPin, Building, Calendar, Download, Edit3, Trash2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ImagePreview } from '../components/ImagePreview';
import { DocumentEditModal } from '../components/DocumentEditModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useDocument, useUpdateDocument, useDeleteDocument } from '../hooks/useDocuments';
import { useFileDownload } from '../hooks/useStorage';
import type { EntityType, DocumentType } from '../lib/types';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: document, isLoading: loading, error } = useDocument(id);
  const downloadMutation = useFileDownload();
  const updateMutation = useUpdateDocument();
  const deleteMutation = useDeleteDocument();

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDownload = async () => {
    if (document?.fileId && document?.fileName) {
      try {
        await downloadMutation.mutateAsync({
          fileId: document.fileId,
          fileName: document.fileName,
        });
      } catch (err) {
        console.error('Download failed:', err);
      }
    }
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleEditSave = async (data: { title: string; content: string; documentType: DocumentType }) => {
    if (!document) return;
    
    try {
      await updateMutation.mutateAsync({
        id: document.id,
        data,
      });
      setEditModalOpen(false);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!document) return;
    
    try {
      await deleteMutation.mutateAsync(document.id);
      navigate('/documents');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'location':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'organization':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'date':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'event':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'unit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const groupEntitiesByType = (entities: any[]) => {
    return entities.reduce((acc, entity) => {
      if (!acc[entity.type]) {
        acc[entity.type] = [];
      }
      acc[entity.type].push(entity);
      return acc;
    }, {} as Record<string, any[]>);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading document...</span>
        </div>
      </Layout>
    );
  }

  if (error || !document) {
    return (
      <Layout>
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Document Not Found</h1>
          <p className="text-gray-500 mb-4">
            {error instanceof Error ? error.message : 'The document you are looking for does not exist.'}
          </p>
          <Link
            to="/documents"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Documents
          </Link>
        </div>
      </Layout>
    );
  }

  const groupedEntities = groupEntitiesByType(document.entities);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            to="/documents"
            className="inline-flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {document.documentType.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-500">
                Created {formatDate(document.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
                         <button
               type="button"
               onClick={handleEdit}
               className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
             >
               <Edit3 className="w-4 h-4 mr-2" />
               Edit
             </button>
             <button
               type="button"
               onClick={handleDelete}
               className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
             >
               <Trash2 className="w-4 h-4 mr-2" />
               Delete
             </button>
            <button
              onClick={handleDownload}
              disabled={downloadMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloadMutation.isPending ? 'Downloading...' : 'Download Original'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Preview */}
            {document.imageUrl && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Preview</h2>
                <ImagePreview
                  src={document.imageUrl}
                  alt={`Preview of ${document.fileName}`}
                  className=""
                  containerClassName="w-full h-96 border border-gray-200 rounded-lg"
                />
              </div>
            )}

            {/* Document Content */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {document.content}
                </p>
              </div>
            </div>

            {/* Entities by Type */}
            {Object.keys(groupedEntities).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Extracted Entities ({document.entities.length})
                </h2>
                <div className="space-y-6">
                  {Object.entries(groupedEntities).map(([type, entities]) => (
                    <div key={type}>
                      <h3 className="text-sm font-medium text-gray-700 mb-3 capitalize flex items-center">
                        {getEntityIcon(type as EntityType)}
                        <span className="ml-2">{type.replace('_', ' ')}s ({(entities as any[]).length})</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(entities as any[]).map((entity: any, index: number) => (
                          <div
                            key={index}
                            className={`border rounded-lg p-3 ${getEntityColor(entity.type)}`}
                          >
                            <div className="flex items-center">
                              {getEntityIcon(entity.type)}
                              <span className="ml-2 font-medium">{entity.name}</span>
                            </div>
                            {entity.date && (
                              <div className="text-xs mt-1 opacity-75">
                                {formatDate(entity.date)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document Metadata */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-500">File Name:</span>
                  <div className="mt-1 text-gray-900">{document.fileName}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-500">File Size:</span>
                  <div className="mt-1 text-gray-900">{formatFileSize(document.fileSize)}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-500">MIME Type:</span>
                  <div className="mt-1 text-gray-900">{document.mimeType}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Added to Archive:</span>
                  <div className="mt-1 text-gray-900">{formatDate(document.createdAt)}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Last Updated:</span>
                  <div className="mt-1 text-gray-900">{formatDate(document.updatedAt)}</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Entities</span>
                  <span className="font-medium text-gray-900">{document.entities.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Content Length</span>
                  <span className="font-medium text-gray-900">{document.content.length} chars</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Entity Types</span>
                  <span className="font-medium text-gray-900">{Object.keys(groupedEntities).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {document && (
          <DocumentEditModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSave={handleEditSave}
            document={document}
            isLoading={updateMutation.isPending}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Document"
          message={`Are you sure you want to delete "${document?.title || 'this document'}"? This action cannot be undone and will remove the document from your archive.`}
          confirmText="Delete"
          confirmVariant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </Layout>
  );
} 