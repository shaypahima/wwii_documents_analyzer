/**
 * Format file size from bytes to human readable format
 */
export function formatFileSize(bytes: string | number): string {
  const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  
  if (isNaN(size)) return 'Unknown size';
  if (size === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(size) / Math.log(1024));
  const formattedSize = (size / Math.pow(1024, index)).toFixed(1);
  
  return `${formattedSize} ${units[index]}`;
}

/**
 * Sanitize filename for safe download
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace potentially problematic characters while preserving Unicode
  return filename
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters with underscore
    .replace(/\s+/g, ' ') // Normalize multiple spaces
    .trim();
}

/**
 * Format date to localized string
 */
export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

/**
 * Get file type icon based on MIME type
 */
export function getFileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
  if (mimeType.includes('text')) return '📄';
  if (mimeType.includes('audio')) return '🎵';
  if (mimeType.includes('video')) return '🎬';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
  return '📄';
}

/**
 * Format MIME type to user-friendly name
 */
export function formatMimeType(mimeType: string): string {
  const mimeTypeMap: Record<string, string> = {
    // Microsoft Office
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Microsoft Word Document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Microsoft Excel Spreadsheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Microsoft PowerPoint Presentation',
    'application/msword': 'Microsoft Word Document (Legacy)',
    'application/vnd.ms-excel': 'Microsoft Excel Spreadsheet (Legacy)',
    'application/vnd.ms-powerpoint': 'Microsoft PowerPoint Presentation (Legacy)',
    
    // Google Docs
    'application/vnd.google-apps.document': 'Google Docs Document',
    'application/vnd.google-apps.spreadsheet': 'Google Sheets Spreadsheet',
    'application/vnd.google-apps.presentation': 'Google Slides Presentation',
    
    // PDF and Text
    'application/pdf': 'PDF Document',
    'text/plain': 'Text File',
    'text/csv': 'CSV File',
    'text/html': 'HTML File',
    'text/xml': 'XML File',
    'application/json': 'JSON File',
    
    // Images
    'image/jpeg': 'JPEG Image',
    'image/jpg': 'JPEG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/svg+xml': 'SVG Image',
    'image/webp': 'WebP Image',
    
    // Audio
    'audio/mpeg': 'MP3 Audio',
    'audio/wav': 'WAV Audio',
    'audio/ogg': 'OGG Audio',
    
    // Video
    'video/mp4': 'MP4 Video',
    'video/mpeg': 'MPEG Video',
    'video/quicktime': 'QuickTime Video',
    'video/webm': 'WebM Video',
    
    // Archives
    'application/zip': 'ZIP Archive',
    'application/x-rar-compressed': 'RAR Archive',
    'application/x-7z-compressed': '7-Zip Archive',
    'application/gzip': 'GZIP Archive',
  };

  // Return mapped name if found
  if (mimeTypeMap[mimeType]) {
    return mimeTypeMap[mimeType];
  }

  // Try to extract a more readable format from the MIME type
  if (mimeType.startsWith('image/')) {
    const format = mimeType.split('/')[1].toUpperCase();
    return `${format} Image`;
  }
  
  if (mimeType.startsWith('audio/')) {
    const format = mimeType.split('/')[1].toUpperCase();
    return `${format} Audio`;
  }
  
  if (mimeType.startsWith('video/')) {
    const format = mimeType.split('/')[1].toUpperCase();
    return `${format} Video`;
  }
  
  if (mimeType.startsWith('text/')) {
    const format = mimeType.split('/')[1].toUpperCase();
    return `${format} Text File`;
  }

  // Fallback to original MIME type
  return mimeType;
} 