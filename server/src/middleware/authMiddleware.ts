import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { AppError, HttpStatusCode } from '../types/common';
import { logger } from '../utils/logger';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
        role: string;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Access token required', HttpStatusCode.UNAUTHORIZED);
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT secret not configured', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', HttpStatusCode.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', HttpStatusCode.UNAUTHORIZED);
    }

    // Add user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token:', error.message);
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid token',
        statusCode: HttpStatusCode.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    logger.error('Authentication error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Authentication failed',
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(HttpStatusCode.UNAUTHORIZED).json({
      success: false,
      error: 'Authentication required',
      statusCode: HttpStatusCode.UNAUTHORIZED,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(HttpStatusCode.FORBIDDEN).json({
      success: false,
      error: 'Admin access required',
      statusCode: HttpStatusCode.FORBIDDEN,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};

/**
 * Optional authentication middleware - doesn't require token
 * Adds user to request if token is present and valid
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    // If token verification fails, just continue without user
    next();
  }
};