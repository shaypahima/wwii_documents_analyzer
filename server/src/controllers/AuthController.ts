import { Request, Response } from 'express';
import { AuthService, authService } from '../services/AuthService';
import { AppError, HttpStatusCode } from '../types/common';
import { SUCCESS_MESSAGES } from '../utils/constants';
import { logger } from '../utils/logger';
import { UserRole } from '@prisma/client';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = authService;
  }

  /**
   * Register a new user
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name, role } = req.body;

      // Validate required fields
      if (!email || !password) {
        throw new AppError('Email and password are required', HttpStatusCode.BAD_REQUEST);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('Invalid email format', HttpStatusCode.BAD_REQUEST);
      }

      // Validate role if provided
      if (role && !Object.values(UserRole).includes(role)) {
        throw new AppError('Invalid role', HttpStatusCode.BAD_REQUEST);
      }

      const result = await this.authService.register({
        email,
        password,
        name,
        role,
      });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: 'User registered successfully',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Registration failed');
    }
  };

  /**
   * Login user
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        throw new AppError('Email and password are required', HttpStatusCode.BAD_REQUEST);
      }

      const result = await this.authService.login({ email, password });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Login successful',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Login failed');
    }
  };

  /**
   * Get current user profile
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', HttpStatusCode.UNAUTHORIZED);
      }

      const profile = await this.authService.getUserProfile(req.user.id);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: profile,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get profile');
    }
  };

  /**
   * Update user profile
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', HttpStatusCode.UNAUTHORIZED);
      }

      const { name, email } = req.body;

      // Validate email format if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new AppError('Invalid email format', HttpStatusCode.BAD_REQUEST);
        }
      }

      const profile = await this.authService.updateProfile(req.user.id, {
        name,
        email,
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Profile updated successfully',
        data: profile,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to update profile');
    }
  };

  /**
   * Change user password
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', HttpStatusCode.UNAUTHORIZED);
      }

      const { currentPassword, newPassword } = req.body;

      // Validate required fields
      if (!currentPassword || !newPassword) {
        throw new AppError(
          'Current password and new password are required',
          HttpStatusCode.BAD_REQUEST
        );
      }

      await this.authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to change password');
    }
  };

  /**
   * Get all users (admin only)
   */
  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, search } = req.query;

      const params = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        search: search as string,
      };

      // Validate pagination
      if (params.page < 1) {
        throw new AppError('Page must be greater than 0', HttpStatusCode.BAD_REQUEST);
      }

      if (params.limit < 1 || params.limit > 100) {
        throw new AppError('Limit must be between 1 and 100', HttpStatusCode.BAD_REQUEST);
      }

      const result = await this.authService.getUsers(params);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: result.users,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get users');
    }
  };

  /**
   * Update user status (admin only)
   */
  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (!userId) {
        throw new AppError('User ID is required', HttpStatusCode.BAD_REQUEST);
      }

      if (typeof isActive !== 'boolean') {
        throw new AppError('isActive must be a boolean', HttpStatusCode.BAD_REQUEST);
      }

      const user = await this.authService.updateUserStatus(userId, isActive);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: user,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to update user status');
    }
  };

  /**
   * Update user role (admin only)
   */
  updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!userId) {
        throw new AppError('User ID is required', HttpStatusCode.BAD_REQUEST);
      }

      if (!role || !Object.values(UserRole).includes(role)) {
        throw new AppError('Valid role is required', HttpStatusCode.BAD_REQUEST);
      }

      const user = await this.authService.updateUserRole(userId, role);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'User role updated successfully',
        data: user,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to update user role');
    }
  };

  /**
   * Verify token (for client-side token validation)
   */
  verifyToken = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Invalid token', HttpStatusCode.UNAUTHORIZED);
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Token is valid',
        data: {
          user: req.user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, 'Token verification failed');
    }
  };

  /**
   * Handle errors consistently
   */
  private handleError(res: Response, error: unknown, defaultMessage: string): void {
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
  }
}