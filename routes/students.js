const express = require('express');
const { body } = require('express-validator');
const studentController = require('../controllers/studentController');
const { authenticateToken, authorizeManager } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateStudent = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('classId').isUUID().withMessage('Class ID must be a valid UUID'),
  body('cohortId').isUUID().withMessage('Cohort ID must be a valid UUID'),
  body('studentNumber').optional().isLength({ min: 1 }).withMessage('Student number cannot be empty')
];

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.get('/class/:classId', studentController.getStudentsByClass);
router.get('/cohort/:cohortId', studentController.getStudentsByCohort);

// Manager-only routes
router.post('/', authorizeManager, validateStudent, studentController.createStudent);
router.put('/:id', authorizeManager, validateStudent, studentController.updateStudent);
router.delete('/:id', authorizeManager, studentController.deleteStudent);

module.exports = router; 