import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { AppError, HttpStatusCode } from '../types/common';
import { logger } from '../utils/logger';
import { UserRole } from '@prisma/client';

export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
  };
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly saltRounds = 12;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET!;
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
  }

  /**
   * Register a new user
   */
  async register(data: CreateUserData): Promise<AuthResponse> {
    try {
      const { email, password, name, role = UserRole.USER } = data;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        throw new AppError('Email already registered', HttpStatusCode.CONFLICT);
      }

      // Validate password strength
      this.validatePassword(password);

      // Hash password
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
          role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      // Generate JWT token
      const token = this.generateToken(user.id, user.email, user.role);

      logger.info(`User registered: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Registration failed:', error);
      throw new AppError('Registration failed');
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const { email, password } = data;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          password: true,
          isActive: true,
        },
      });

      if (!user) {
        throw new AppError('Invalid credentials', HttpStatusCode.UNAUTHORIZED);
      }

      if (!user.isActive) {
        throw new AppError('Account is deactivated', HttpStatusCode.UNAUTHORIZED);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', HttpStatusCode.UNAUTHORIZED);
      }

      // Generate JWT token
      const token = this.generateToken(user.id, user.email, user.role);

      logger.info(`User logged in: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Login failed:', error);
      throw new AppError('Login failed');
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', HttpStatusCode.NOT_FOUND);
      }

      return {
        ...user,
        name: user.name || undefined,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to get user profile:', error);
      throw new AppError('Failed to get user profile');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: { name?: string; email?: string }
  ): Promise<UserProfile> {
    try {
      const updateData: any = {};

      if (data.name !== undefined) {
        updateData.name = data.name;
      }

      if (data.email) {
        // Check if email is already taken by another user
        const existingUser = await prisma.user.findFirst({
          where: {
            email: data.email.toLowerCase(),
            NOT: { id: userId },
          },
        });

        if (existingUser) {
          throw new AppError('Email already in use', HttpStatusCode.CONFLICT);
        }

        updateData.email = data.email.toLowerCase();
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info(`User profile updated: ${user.email}`);

      return {
        ...user,
        name: user.name || undefined,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to update user profile:', error);
      throw new AppError('Failed to update user profile');
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          password: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', HttpStatusCode.NOT_FOUND);
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', HttpStatusCode.UNAUTHORIZED);
      }

      // Validate new password
      this.validatePassword(newPassword);

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      logger.info(`Password changed for user: ${user.email}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to change password:', error);
      throw new AppError('Failed to change password');
    }
  }

  /**
   * Get all users (admin only)
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    users: UserProfile[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, search } = params;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        users: users.map(user => ({
          ...user,
          name: user.name || undefined,
        })),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error('Failed to get users:', error);
      throw new AppError('Failed to get users');
    }
  }

  /**
   * Update user status (admin only)
   */
  async updateUserStatus(userId: string, isActive: boolean): Promise<UserProfile> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info(`User status updated: ${user.email} - Active: ${isActive}`);

      return {
        ...user,
        name: user.name || undefined,
      };
    } catch (error) {
      logger.error('Failed to update user status:', error);
      throw new AppError('Failed to update user status');
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: UserRole): Promise<UserProfile> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info(`User role updated: ${user.email} - Role: ${role}`);

      return {
        ...user,
        name: user.name || undefined,
      };
    } catch (error) {
      logger.error('Failed to update user role:', error);
      throw new AppError('Failed to update user role');
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, email: string, role: UserRole): string {
    return jwt.sign(
      {
        userId,
        email,
        role,
      },
      this.jwtSecret,
      {
        expiresIn: '24h',
        issuer: 'ww2-scanner',
      }
    );
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new AppError(
        'Password must be at least 8 characters long',
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new AppError(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        HttpStatusCode.BAD_REQUEST
      );
    }
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: string; email: string; role: UserRole } {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      throw new AppError('Invalid token', HttpStatusCode.UNAUTHORIZED);
    }
  }
}

export const authService = new AuthService();