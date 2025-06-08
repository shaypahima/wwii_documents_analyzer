import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { DatabaseClient } from './config/database';
import config from './config/environment';
import { logger, logUtils, performanceLogger } from './utils/logger';
import { AppError, HttpStatusCode } from './types/common';

// Import routes
import documentRoutes from './routes/documentRoutes';
import entityRoutes from './routes/entityRoutes';
import storageRoutes from './routes/storageRoutes';
import authRoutes from './routes/authRoutes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.PORT;
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(cors({
      origin : '*',
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: config.MAX_FILE_SIZE }));
    this.app.use(express.urlencoded({ extended: true, limit: config.MAX_FILE_SIZE }));

    // Request logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const timer = performanceLogger.startTimer(`${req.method} ${req.path}`);
      
      res.on('finish', () => {
        const duration = timer.end();
        logUtils.logHttpRequest(req, res, duration);
      });

      next();
    });

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(HttpStatusCode.OK).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.NODE_ENV,
        version: '1.0.0'
      });
    });

    // API info endpoint
    this.app.get('/api', (req: Request, res: Response) => {
      res.status(HttpStatusCode.OK).json({
        name: 'WWII Document Scanner API',
        version: '1.0.0',
        description: 'API for scanning and analyzing WWII historical documents',
        endpoints: {
          auth: '/api/auth',
          documents: '/api/documents',
          entities: '/api/entities',
          storage: '/api/storage',
          health: '/health'
        },
        authentication: {
          type: 'JWT Bearer Token',
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          protectedEndpoints: [
            '/api/storage/*',
            '/api/documents/analyze/*',
            '/api/documents/process/*'
          ]
        },
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/documents', documentRoutes);
    this.app.use('/api/entities', entityRoutes);
    this.app.use('/api/storage', storageRoutes);

    // 404 handler for unknown routes
    this.app.use((req: Request, res: Response) => {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
        statusCode: HttpStatusCode.NOT_FOUND,
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use(errorHandler);

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection:', reason);
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      this.shutdown();
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      this.shutdown();
    });
  }

  private async shutdown(): Promise<void> {
    try {
      logger.info('Starting graceful shutdown...');
      
      // Close database connections
      await DatabaseClient.disconnect();
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await DatabaseClient.connect();
      
      // Test database connection
      const isHealthy = await DatabaseClient.healthCheck();
      if (!isHealthy) {
        throw new Error('Database health check failed');
      }

      // Start server
      this.app.listen(this.port, () => {
        console.log(`🚀 Server is running on port ${this.port}`);
        console.log(`📊 Environment: ${config.NODE_ENV}`);
        console.log(`🗄️  Database: Connected`);
        console.log(`📁 Google Drive Folder: ${config.GOOGLE_DRIVE_FOLDER_ID}`);
        console.log(`🤖 AI Service: Groq API configured`);
        console.log(`🔐 Authentication: JWT enabled`);
        
        if (config.NODE_ENV === 'development') {
          console.log(`📖 API Documentation: http://localhost:${this.port}/api`);
          console.log(`❤️  Health Check: http://localhost:${this.port}/health`);
          console.log(`🔑 Auth endpoints: http://localhost:${this.port}/api/auth`);
        }
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

export default Server;