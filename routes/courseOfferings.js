const express = require('express');
const { body } = require('express-validator');
const courseOfferingController = require('../controllers/courseOfferingController');
const { authenticateToken, authorizeManager } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateCourseOffering = [
  body('moduleId').isUUID().withMessage('Module ID must be a valid UUID'),
  body('classId').isUUID().withMessage('Class ID must be a valid UUID'),
  body('facilitatorId').isUUID().withMessage('Facilitator ID must be a valid UUID'),
  body('trimester').isInt({ min: 1, max: 3 }).withMessage('Trimester must be between 1 and 3'),
  body('modeId').isUUID().withMessage('Mode ID must be a valid UUID'),
  body('year').isInt({ min: 2020, max: 2030 }).withMessage('Year must be between 2020 and 2030')
];

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.get('/', courseOfferingController.getAllCourseOfferings);
router.get('/filter', courseOfferingController.filterCourseOfferings);
router.get('/:id', courseOfferingController.getCourseOfferingById);
router.get('/facilitator/:facilitatorId', courseOfferingController.getCourseOfferingsByFacilitator);

// Manager-only routes
router.post('/', authorizeManager, validateCourseOffering, courseOfferingController.createCourseOffering);
router.put('/:id', authorizeManager, validateCourseOffering, courseOfferingController.updateCourseOffering);
router.delete('/:id', authorizeManager, courseOfferingController.deleteCourseOffering);

module.exports = router; 