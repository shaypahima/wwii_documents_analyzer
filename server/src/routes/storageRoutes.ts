import { Router, Request, Response } from 'express';
import { storageService } from '../services/StorageService';
import { AppError, HttpStatusCode } from '../types/common';
import { logger } from '../utils/logger';
import { sanitizeFilename } from '../utils/helpers';

const router = Router();

/**
 * Handle errors consistently
 */
const handleError = (res: Response, error: unknown, defaultMessage: string): void => {
  if (error instanceof AppError) {
    logger.warn(`${defaultMessage}: ${error.message}`);
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
    });
  } else {
    logger.error(`${defaultMessage}:`, error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: defaultMessage,
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * @route   GET /api/storage/files
 * @desc    Get directory content from Google Drive
 * @access  Public
 * @query   folderId - Optional folder ID, page - Page number, limit - Items per page
 */
router.get('/files', async (req: Request, res: Response): Promise<void> => {
  try {
    const { folderId, page, limit } = req.query;
    const pageNum = page ? parseInt(page as string, 10) : 1;
    const limitNum = limit ? parseInt(limit as string, 10) : 20;

    // Validate pagination parameters
    if (pageNum < 1) {
      throw new AppError('Page must be greater than 0', HttpStatusCode.BAD_REQUEST);
    }

    if (limitNum < 1 || limitNum > 100) {
      throw new AppError('Limit must be between 1 and 100', HttpStatusCode.BAD_REQUEST);
    }

    const result = await storageService.getDirectoryContent(folderId as string, pageNum, limitNum);

    res.status(HttpStatusCode.OK).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleError(res, error, 'Failed to get directory content');
  }
});

/**
 * @route   GET /api/storage/files/:fileId
 * @desc    Get file metadata from Google Drive
 * @access  Public
 * @param   fileId - Google Drive file ID
 */
router.get('/files/:fileId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    console.log(fileId);
    if (!fileId) {
      throw new AppError('File ID is required', HttpStatusCode.BAD_REQUEST);
    }

    const metadata = await storageService.getFileMetadata(fileId);

    res.status(HttpStatusCode.OK).json({
      success: true,
      data: metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleError(res, error, 'Failed to get file metadata');
  }
});

/**
 * @route   GET /api/storage/files/:fileId/content
 * @desc    Get file content from Google Drive
 * @access  Public
 * @param   fileId - Google Drive file ID
 */
router.get('/files/:fileId/content', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      throw new AppError('File ID is required', HttpStatusCode.BAD_REQUEST);
    }

    const file = await storageService.getFileContent(fileId);

    // Sanitize filename for Content-Disposition header
    const sanitizedFilename = sanitizeFilename(file.name);
    // Set appropriate headers
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.size);
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);

    // Send file data
    if (file.data) {
      res.send(file.data);
    } else {
      throw new AppError('File content not available', HttpStatusCode.NOT_FOUND);
    }
  } catch (error) {
    handleError(res, error, 'Failed to get file content');
  }
});

/**
 * @route   GET /api/storage/search
 * @desc    Search files in Google Drive
 * @access  Public
 * @query   q - Search query, folderId - Optional folder ID, page - Page number, limit - Items per page
 */
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q: query, folderId, page, limit } = req.query;
    const pageNum = page ? parseInt(page as string, 10) : 1;
    const limitNum = limit ? parseInt(limit as string, 10) : 20;

    if (!query || typeof query !== 'string') {
      throw new AppError('Search query is required', HttpStatusCode.BAD_REQUEST);
    }

    if (query.trim().length < 2) {
      throw new AppError('Search query must be at least 2 characters', HttpStatusCode.BAD_REQUEST);
    }

    // Validate pagination parameters
    if (pageNum < 1) {
      throw new AppError('Page must be greater than 0', HttpStatusCode.BAD_REQUEST);
    }

    if (limitNum < 1 || limitNum > 100) {
      throw new AppError('Limit must be between 1 and 100', HttpStatusCode.BAD_REQUEST);
    }

    const result = await storageService.searchFiles(query.trim(), folderId as string, pageNum, limitNum);

    res.status(HttpStatusCode.OK).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleError(res, error, 'Failed to search files');
  }
});

/**
 * @route   GET /api/storage/info
 * @desc    Get storage quota information
 * @access  Public
 */
router.get('/info', async (req: Request, res: Response): Promise<void> => {
  try {
    const storageInfo = await storageService.getStorageInfo();

    res.status(HttpStatusCode.OK).json({
      success: true,
      data: storageInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleError(res, error, 'Failed to get storage information');
  }
});

/**
 * @route   GET /api/storage/health
 * @desc    Test Google Drive connectivity
 * @access  Public
 */
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const isConnected = await storageService.testConnection();

    res.status(HttpStatusCode.OK).json({
      success: true,
      data: {
        connected: isConnected,
        service: 'Google Drive',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleError(res, error, 'Failed to test storage connection');
  }
});

export default router;