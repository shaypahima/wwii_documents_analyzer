import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before importing other modules
dotenv.config();

import Server from './src/app';
import { logger } from './src/utils/logger';
import { Console } from 'console';

async function bootstrap() {

  try {
    logger.info('🌟 Starting WWII Document Scanner Server...');
    
    // Validate environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'GOOGLE_CREDENTIALS_PATH',
      'GOOGLE_DRIVE_FOLDER_ID',
      'GROQ_API_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Create and start server
    const server = new Server();
    await server.start();

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the application\

bootstrap().catch((error) => {
  logger.error('Bootstrap failed:', error);
  process.exit(1);
});