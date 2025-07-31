const express = require('express');
const { body } = require('express-validator');
const classController = require('../controllers/classController');
const { authenticateToken, authorizeManager } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateClass = [
  body('name').isLength({ min: 2 }).withMessage('Class name must be at least 2 characters long'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('graduationDate').isISO8601().withMessage('Graduation date must be a valid date'),
  body('trimester').isIn(['January', 'May', 'September']).withMessage('Trimester must be January, May, or September'),
  body('year').isInt({ min: 2020, max: 2030 }).withMessage('Year must be between 2020 and 2030')
];

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.get('/', classController.getAllClasses);
router.get('/:id', classController.getClassById);
router.get('/year/:year', classController.getClassesByYear);
router.get('/trimester/:trimester', classController.getClassesByTrimester);

// Manager-only routes
router.post('/', authorizeManager, validateClass, classController.createClass);
router.put('/:id', authorizeManager, validateClass, classController.updateClass);
router.delete('/:id', authorizeManager, classController.deleteClass);

module.exports = router; 