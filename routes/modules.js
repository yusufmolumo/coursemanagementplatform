const express = require('express');
const { body } = require('express-validator');
const moduleController = require('../controllers/moduleController');
const { authenticateToken, authorizeManager } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateModule = [
  body('name').isLength({ min: 2 }).withMessage('Module name must be at least 2 characters long'),
  body('half').isIn(['H1', 'H2']).withMessage('Half must be either H1 or H2'),
  body('credits').optional().isInt({ min: 1, max: 30 }).withMessage('Credits must be between 1 and 30')
];

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.get('/', moduleController.getAllModules);
router.get('/:id', moduleController.getModuleById);
router.get('/half/:half', moduleController.getModulesByHalf);

// Manager-only routes
router.post('/', authorizeManager, validateModule, moduleController.createModule);
router.put('/:id', authorizeManager, validateModule, moduleController.updateModule);
router.delete('/:id', authorizeManager, moduleController.deleteModule);

module.exports = router; 