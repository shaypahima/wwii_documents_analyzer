import { google } from "googleapis";
import { AppError, Nullable, Optional } from "../types/common";
import config from "../config/environment";
import path from "path";
import fs from "fs";
import logger from "../utils/logger";
import { File, FileListItem } from "../types/database";
import { CacheService, cacheService } from "./CacheService";

export class StorageService {
  private drive: any; //drive_v3.Drive
  private auth: any; //GoogleAuth<JSONClient>
  private defaultFolderId: string;

  constructor(private cacheService: CacheService) {
    this.defaultFolderId = config.GOOGLE_DRIVE_FOLDER_ID;
    this.initializeAuth();
    this.initializeDrive();
    
  }

  private async initializeAuth() {
    try {
      const credentials = config.GOOGLE_CREDENTIALS_PATH;

      if (!fs.existsSync(credentials)) {
        throw new Error(
          `Google credentials file not found at ${credentials}. ` +
            "Please ensure GOOGLE_CREDENTIALS_PATH is set correctly or the credentials file exists."
        );
      }

      this.auth = new google.auth.GoogleAuth({
        keyFile: credentials,
        scopes: [
          "https://www.googleapis.com/auth/drive.readonly",
          "https://www.googleapis.com/auth/drive.metadata.readonly",
        ],
      });
    } catch (error) {
      logger.error("Error initializing Google Drive", error);
      throw new AppError("Failed to initialize Google Drive");
    }
  }
  private async initializeDrive() {
    try {
      this.drive = google.drive({ version: "v3", auth: this.auth });
      logger.info("Google Drive initialized successfully");
    } catch (error) {
      logger.error("Error initializing Google Drive", error);
      throw new AppError("Failed to initialize Google Drive");
    }
  }

  /**
   * Get directory content from Google Drive
   */
  async getDirectoryContent(folderId?: string, page: number = 1, limit: number = 20): Promise<{
    files: FileListItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // Validate and set target folder ID
      let targetFolderId = folderId;
      if (!targetFolderId || targetFolderId.trim() === '' || targetFolderId === 'undefined' || targetFolderId === 'null') {
        targetFolderId = this.defaultFolderId;
      }
      
      const cacheKey = `dir_content_${targetFolderId}_${page}_${limit}`;

      // Check cache first
      const cachedResult = this.cacheService.get(cacheKey);
      if (cachedResult) {
        logger.info(`Returning cached directory content for folder ${targetFolderId}, page ${page}`);
        return cachedResult as any;
      }

      logger.info(`Fetching directory content for folder ${targetFolderId}, page ${page}, limit ${limit}`);

      const query = `'${targetFolderId}' in parents and trashed = false`;
      
      // For pagination, we'll fetch all files first to get accurate total count
      // This is a limitation of Google Drive API - it doesn't provide total count directly
      const allFilesResponse = await this.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, size, modifiedTime, createdTime)',
        pageSize: 100, // Reduce from 1000 to be consistent and avoid potential issues
        orderBy: 'name',
      });

      const allFiles = allFilesResponse.data.files || [];
      
      const processedFiles: FileListItem[] = allFiles.map((file: any) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? parseInt(file.size, 10) : 0,
        type: this.getFileTypeFromMimeType(file.mimeType),
        modifiedTime: file.modifiedTime,
        createdTime: file.createdTime,
        isFolder: file.mimeType === 'application/vnd.google-apps.folder'
      }));

      // Filter supported file types
      const supportedFiles = processedFiles.filter(file => 
        file.isFolder || this.isSupportedFileType(file.type)
      );

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedFiles = supportedFiles.slice(startIndex, endIndex);

      const result = {
        files: paginatedFiles,
        total: supportedFiles.length,
        page,
        limit
      };

      // Cache the result for 5 minutes
      this.cacheService.set(cacheKey, result, 300);

      logger.info(`Retrieved ${paginatedFiles.length} files from folder ${targetFolderId} (page ${page}/${Math.ceil(supportedFiles.length / limit)})`);
      return result;

    } catch (error) {
      logger.error(`Failed to get directory content for folder "${folderId}":`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AppError(`Failed to get directory content: ${errorMessage}`);
    }
  }

  /**
   * Get file metadata from Google Drive
   */
  async getFileMetadata(fileId: string): Promise<File> {
    try {
      const cacheKey = `metadata_${fileId}`;

      // Check cache first
      const cachedResult: Nullable<File> = this.cacheService.get(cacheKey);
      if (cachedResult) {
        logger.info(`Returning cached metadata for file ${fileId}`);
        return cachedResult;
      }

      logger.info(`Fetching metadata for file ${fileId}`);

      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, modifiedTime, createdTime, parents',
      });

      const fileData = response.data;
      const metadata: File = {
        id: fileData.id,
        name: fileData.name,
        mimeType: fileData.mimeType,
        size: fileData.size || '0',
        modifiedTime: fileData.modifiedTime,
        createdTime: fileData.createdTime,
        parents: fileData.parents
      };

      // Cache for 10 minutes
      this.cacheService.set(cacheKey, metadata, 600);

      logger.info(`Retrieved metadata for file ${fileId}: ${metadata.name}`);
      return metadata;

    } catch (error) {
      logger.error(`Failed to get file metadata for ${fileId}:`, error);
      throw new AppError(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }



  /**
   * Get file content from Google Drive
   */
  async getFileContent(fileId: string): Promise<File> {
    try {
      logger.info(`Fetching content for file ${fileId}`);

      // First get metadata
      const metadata = await this.getFileMetadata(fileId);

      // Check file size limit (50MB)
      const maxSize = 50 * 1024 * 1024;
      const fileSize = parseInt(metadata.size, 10);
      
      if (fileSize > maxSize) {
        throw new AppError(`File too large: ${fileSize} bytes. Maximum allowed: ${maxSize} bytes`);
      }

      // Get file content
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
      }, {
        responseType: 'arraybuffer'
      });

      if (!response.data) {
        throw new AppError('No file content received');
      }

      const uint8Array = new Uint8Array(response.data as ArrayBuffer);
      const buffer = Buffer.from(uint8Array);

      const file: File = {
        id: fileId,
        name: metadata.name,
        mimeType: metadata.mimeType || response.headers['content-type'] || 'application/octet-stream',
        size: response.headers['content-length'] || metadata.size,
        data: buffer,
        modifiedTime: metadata.modifiedTime,
        createdTime: metadata.createdTime
      };

      logger.info(`Retrieved content for file ${fileId}: ${file.name} (${file.size} bytes)`);
      return file;

    } catch (error) {
      logger.error(`Failed to get file content for ${fileId}:`, error);
      throw new AppError(`Failed to get file content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search files in Google Drive
   */
  async searchFiles(query: string, folderId?: string, page: number = 1, limit: number = 20): Promise<{
    files: FileListItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      logger.info(`Searching files with query: "${query}", folderId: "${folderId}", page: ${page}, limit: ${limit}`);

      // Escape special characters in search query
      const escapedQuery = query.replace(/'/g, "\\'").replace(/"/g, '\\"');
      
      let searchQuery = `name contains '${escapedQuery}' and trashed = false`;
      
      // Only add parent folder condition if folderId is provided and not empty
      if (folderId && folderId.trim() !== '' && folderId !== 'undefined' && folderId !== 'null') {
        searchQuery += ` and '${folderId}' in parents`;
        logger.info(`Adding folder filter: ${folderId}`);
      }

      logger.info(`Final search query: ${searchQuery}`);

      // Fetch all matching files to get accurate total count
      const allFilesResponse = await this.drive.files.list({
        q: searchQuery,
        fields: 'files(id, name, mimeType, size, modifiedTime, createdTime)',
        pageSize: 100, // Reduce from 1000 to avoid potential issues
        orderBy: 'name',
      });

      const allFiles = allFilesResponse.data.files || [];
      
      const processedFiles: FileListItem[] = allFiles.map((file: any) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? parseInt(file.size, 10) : 0,
        type: this.getFileTypeFromMimeType(file.mimeType),
        modifiedTime: file.modifiedTime,
        createdTime: file.createdTime,
        isFolder: file.mimeType === 'application/vnd.google-apps.folder'
      }));

      // Filter supported file types
      const supportedFiles = processedFiles.filter(file => 
        file.isFolder || this.isSupportedFileType(file.type)
      );

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedFiles = supportedFiles.slice(startIndex, endIndex);

      const result = {
        files: paginatedFiles,
        total: supportedFiles.length,
        page,
        limit
      };

      logger.info(`Found ${paginatedFiles.length} files matching query: "${query}" (page ${page}/${Math.ceil(supportedFiles.length / limit)})`);
      return result;

    } catch (error) {
      logger.error(`Failed to search files with query "${query}":`, error);
      
      // Provide more specific error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AppError(`Failed to search files: ${errorMessage}`);
    }
  }

  /**
   * Get file type from MIME type
   */
  private getFileTypeFromMimeType(mimeType: string): string {
    const mimeTypeMap: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
      'text/plain': 'txt',
      'application/vnd.google-apps.folder': 'folder'
    };

    return mimeTypeMap[mimeType] || 'unknown';
  }

  /**
   * Check if file type is supported
   */
  private isSupportedFileType(fileType: string): boolean {
    return config.ALLOWED_FILE_TYPES.includes(fileType);
  }

  /**
   * Test Google Drive connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.drive.about.get({ fields: 'user' });
      return true;
    } catch (error) {
      logger.error('Google Drive connection test failed:', error);
      return false;
    }
  }

  /**
   * Get storage quota information
   */
  async getStorageInfo(): Promise<{
    limit: string;
    usage: string;
    usageInDrive: string;
  }> {
    try {
      const response = await this.drive.about.get({ 
        fields: 'storageQuota' 
      });

      return {
        limit: response.data.storageQuota?.limit || 'unlimited',
        usage: response.data.storageQuota?.usage || '0',
        usageInDrive: response.data.storageQuota?.usageInDrive || '0'
      };
    } catch (error) {
      logger.error('Failed to get storage info:', error);
      throw new AppError('Failed to get storage information');
    }
  }

}

export const storageService = new StorageService(cacheService);
