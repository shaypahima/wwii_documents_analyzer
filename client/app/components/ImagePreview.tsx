import { useState } from 'react';
import { Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

interface ImagePreviewProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  showPlaceholder?: boolean;
}

export function ImagePreview({ 
  src, 
  alt, 
  className = '', 
  containerClassName = '',
  showPlaceholder = true 
}: ImagePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const isImageFile = (src?: string) => {
    if (!src) return false;
    return src.startsWith('data:image/') || /\.(jpe?g|png|gif|bmp|webp)$/i.test(src);
  };

  if (!src || !isImageFile(src)) {
    if (!showPlaceholder) return null;
    
    return (
      <div className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-8 text-gray-500 ${containerClassName}`}>
        <ImageIcon className="w-12 h-12 mb-2 text-gray-400" />
        <p className="text-sm font-medium">No preview available</p>
        <p className="text-xs text-gray-400 mt-1">Document image not found</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center z-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
          <p className="text-sm text-gray-600">Loading preview...</p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-red-50 border-2 border-dashed border-red-300 rounded-lg flex flex-col items-center justify-center text-red-500 z-10">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="text-sm font-medium">Failed to load image</p>
          <p className="text-xs text-red-400 mt-1">Preview unavailable</p>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={`${loading || error ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200 rounded-lg shadow-sm w-full h-full object-contain ${className}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
} 