import { Router } from 'express';
import { EntityController } from '../controllers/EntityController';


const router = Router();


// Initialize controller
const entityController = new EntityController();

/**
 * @route   POST /api/entities
 * @desc    Create a new entity
 * @access  Public
 */
router.post('/', entityController.createEntity);

/**
 * @route   GET /api/entities
 * @desc    Get all entities with filters and pagination
 * @access  Public
 * @query   page, limit, type, keyword, date
 */
router.get('/', entityController.getEntities);

/**
 * @route   GET /api/entities/search
 * @desc    Search entities
 * @access  Public
 * @query   q (search query), page, limit
 */
router.get('/search', entityController.searchEntities);

/**
 * @route   GET /api/entities/stats
 * @desc    Get entity statistics
 * @access  Public
 */
router.get('/stats', entityController.getEntityStats);

/**
 * @route   POST /api/entities/find-or-create
 * @desc    Find existing entity or create new one
 * @access  Public
 */
router.post('/find-or-create', entityController.findOrCreateEntity);

/**
 * @route   GET /api/entities/type/:type
 * @desc    Get entities by type
 * @access  Public
 * @param   type - Entity type (person, location, organization, event, date, unit)
 * @query   page, limit
 */
router.get('/type/:type', entityController.getEntitiesByType);

/**
 * @route   GET /api/entities/:id
 * @desc    Get entity by ID
 * @access  Public
 * @param   id - Entity ID
 * @query   includeDocuments - Include related documents (true/false)
 */
router.get('/:id', entityController.getEntity);

/**
 * @route   PUT /api/entities/:id
 * @desc    Update entity
 * @access  Public
 * @param   id - Entity ID
 */
router.put('/:id', entityController.updateEntity);

/**
 * @route   DELETE /api/entities/:id
 * @desc    Delete entity
 * @access  Public
 * @param   id - Entity ID
 */
router.delete('/:id', entityController.deleteEntity);

export default router;