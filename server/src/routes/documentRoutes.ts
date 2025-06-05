import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';


const router = Router();

// Initialize controller
const documentController = new DocumentController();

/**
 * @route   POST /api/documents
 * @desc    Create a new document
 * @access  Public
 */
router.post('/', documentController.createDocument);

/**
 * @route   GET /api/documents
 * @desc    Get all documents with filters and pagination
 * @access  Public
 * @query   page, limit, documentType, keyword, entity, startDate, endDate
 */
router.get('/', documentController.getDocuments);

/**
 * @route   GET /api/documents/search
 * @desc    Search documents
 * @access  Public
 * @query   q (search query), page, limit
 */
router.get('/search', documentController.searchDocuments);

/**
 * @route   GET /api/documents/stats
 * @desc    Get document statistics
 * @access  Public
 */
router.get('/stats', documentController.getDocumentStats);

/**
 * @route   GET /api/documents/entity/:entityId
 * @desc    Get documents by entity
 * @access  Public
 * @param   entityId - Entity ID
 * @query   page, limit
 */
router.get('/entity/:entityId', documentController.getDocumentsByEntity);

/**
 * @route   GET /api/documents/:id
 * @desc    Get document by ID
 * @access  Public
 * @param   id - Document ID
 */
router.get('/:id', documentController.getDocument);

/**
 * @route   PUT /api/documents/:id
 * @desc    Update document
 * @access  Public
 * @param   id - Document ID
 */
router.put('/:id', documentController.updateDocument);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete document
 * @access  Public
 * @param   id - Document ID
 */
router.delete('/:id', documentController.deleteDocument);

/**
 * @route   POST /api/documents/analyze/:fileId
 * @desc    Analyze document from Google Drive (without saving)
 * @access  Public
 * @param   fileId - Google Drive file ID
 */
router.post('/analyze/:fileId', documentController.analyzeDocument);

/**
 * @route   POST /api/documents/process/:fileId
 * @desc    Process and save document from Google Drive
 * @access  Public
 * @param   fileId - Google Drive file ID
 */
router.post('/process/:fileId', documentController.processAndSaveDocument);

export default router;