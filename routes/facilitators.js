const express = require('express');
const { body } = require('express-validator');
const facilitatorController = require('../controllers/facilitatorController');
const { authenticateToken, authorizeManager } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateFacilitator = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('qualification').isLength({ min: 1 }).withMessage('Qualification cannot be empty'),
  body('location').isLength({ min: 1 }).withMessage('Location cannot be empty'),
  body('managerId').isUUID().withMessage('Manager ID must be a valid UUID'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.get('/', facilitatorController.getAllFacilitators);
router.get('/:id', facilitatorController.getFacilitatorById);
router.get('/manager/:managerId', facilitatorController.getFacilitatorsByManager);
router.get('/:id/courses', facilitatorController.getFacilitatorCourses);

// Manager-only routes
router.post('/', authorizeManager, validateFacilitator, facilitatorController.createFacilitator);
router.put('/:id', authorizeManager, validateFacilitator, facilitatorController.updateFacilitator);
router.delete('/:id', authorizeManager, facilitatorController.deleteFacilitator);

module.exports = router; 