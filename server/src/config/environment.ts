import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  GOOGLE_CREDENTIALS_PATH: string;
  GOOGLE_DRIVE_FOLDER_ID: string;
  GROQ_API_KEY: string;
  LOG_LEVEL: string;
  CACHE_TTL: number;
  MAX_FILE_SIZE: string;
  ALLOWED_FILE_TYPES: string[];
}

// Function to resolve credentials path for both development and production
function resolveCredentialsPath(): string {
  if (process.env.GOOGLE_CREDENTIALS_PATH) {
    // If environment variable is provided, use it as-is if it's absolute
    // or resolve it relative to the project root
    const envPath = process.env.GOOGLE_CREDENTIALS_PATH;
    if (path.isAbsolute(envPath)) {
      return envPath;
    }
    // For relative paths, resolve from the project root (/app in Docker)
    return path.resolve(process.cwd(), envPath);
  }
  
  // Default fallback - check multiple possible locations
  const possiblePaths = [
    // Docker production location
    path.resolve(process.cwd(), 'src/config/service-account-key.json'),
    // Development location
    path.resolve(__dirname, 'service-account-key.json'),
    // Alternative development location
    path.resolve(__dirname, '../config/service-account-key.json'),
    // Legacy location
    path.resolve(__dirname, '../config/credentials/service-account-key.json')
  ];
  
  return possiblePaths[0]; // Return the first one, let the existence check happen in StorageService
}

const config: EnvironmentConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  GOOGLE_CREDENTIALS_PATH: resolveCredentialsPath(),
  GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '3600', 10),
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '50mb',
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(','),
};

// Validate required environment variables

export default config;

