import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Initialize controller
const authController = new AuthController();

/**
 * @route   GET /api/auth
 * @desc    Get auth API information
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    name: 'Authentication API',
    version: '1.0.0',
    description: 'Authentication and user management endpoints',
    endpoints: {
      public: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      private: {
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/change-password',
        verifyToken: 'GET /api/auth/verify'
      },
      admin: {
        getUsers: 'GET /api/auth/users',
        updateUserStatus: 'PUT /api/auth/users/:userId/status',
        updateUserRole: 'PUT /api/auth/users/:userId/role'
      }
    },
    authentication: {
      type: 'JWT Bearer Token',
      header: 'Authorization: Bearer <token>'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticateToken, authController.changePassword);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
router.get('/verify', authenticateToken, authController.verifyToken);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get('/users', authenticateToken, requireAdmin, authController.getUsers);

/**
 * @route   PUT /api/auth/users/:userId/status
 * @desc    Update user status (admin only)
 * @access  Private (Admin)
 */
router.put('/users/:userId/status', authenticateToken, requireAdmin, authController.updateUserStatus);

/**
 * @route   PUT /api/auth/users/:userId/role
 * @desc    Update user role (admin only)
 * @access  Private (Admin)
 */
router.put('/users/:userId/role', authenticateToken, requireAdmin, authController.updateUserRole);

export default router;