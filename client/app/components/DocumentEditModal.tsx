import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Document, DocumentType } from '../lib/types';

interface DocumentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; documentType: DocumentType }) => void;
  document: Document;
  isLoading?: boolean;
}

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'letter', label: 'Letter' },
  { value: 'report', label: 'Report' },
  { value: 'photo', label: 'Photo' },
  { value: 'newspaper', label: 'Newspaper' },
  { value: 'list', label: 'List' },
  { value: 'diary_entry', label: 'Diary Entry' },
  { value: 'book', label: 'Book' },
  { value: 'map', label: 'Map' },
  { value: 'biography', label: 'Biography' },
];

export function DocumentEditModal({
  isOpen,
  onClose,
  onSave,
  document,
  isLoading = false,
}: DocumentEditModalProps) {
  const [formData, setFormData] = useState({
    title: document?.title || '',
    content: document?.content || '',
    documentType: document?.documentType || 'letter' as DocumentType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && document) {
      setFormData({
        title: document.title || '',
        content: document.content || '',
        documentType: document.documentType || 'letter',
      });
      setErrors({});
    }
  }, [isOpen, document]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.documentType) {
      newErrors.documentType = 'Document type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 animate-in fade-in duration-200 animate-modal-enter" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black opacity-30 transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      <div className="flex min-h-full items-center justify-center px-4 py-8 pointer-events-none">
        {/* Modal panel */}
        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-2xl w-full pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 animate-modal-enter">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                  Edit Document
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transform transition-all duration-150 hover:scale-110 active:scale-90"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6 transition-transform duration-200" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    disabled={isLoading}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 focus:scale-[1.02] ${
                      errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500 animate-shake' : ''
                    }`}
                    placeholder="Enter document title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Document Type */}
                <div>
                  <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                    Document Type
                  </label>
                  <select
                    id="documentType"
                    value={formData.documentType}
                    onChange={(e) => handleInputChange('documentType', e.target.value as DocumentType)}
                    disabled={isLoading}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 focus:scale-[1.02] ${
                      errors.documentType ? 'border-red-300 focus:border-red-500 focus:ring-red-500 animate-shake' : ''
                    }`}
                  >
                    <option value="">Select document type</option>
                    {documentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.documentType && (
                    <p className="mt-1 text-sm text-red-600">{errors.documentType}</p>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    id="content"
                    rows={12}
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    disabled={isLoading}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 focus:scale-[1.01] ${
                      errors.content ? 'border-red-300 focus:border-red-500 focus:ring-red-500 animate-shake' : ''
                    }`}
                    placeholder="Enter document content"
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.content.length} characters
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-150 hover:scale-105 active:scale-95"
              >
                <Save className={`h-4 w-4 mr-2 transition-transform duration-200 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 transform transition-all duration-150 hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 