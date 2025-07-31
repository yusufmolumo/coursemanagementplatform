const express = require('express');
const { body } = require('express-validator');
const activityTrackerController = require('../controllers/activityTrackerController');
const { authenticateToken, authorizeManagerOrFacilitator } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateActivityTracker = [
  body('allocationId').isUUID().withMessage('Allocation ID must be a valid UUID'),
  body('weekNumber').isInt({ min: 1, max: 52 }).withMessage('Week number must be between 1 and 52'),
  body('attendance').isArray().withMessage('Attendance must be an array'),
  body('formativeOneGrading').isIn(['Done', 'Pending', 'Not Started']).withMessage('Invalid formative one grading status'),
  body('formativeTwoGrading').isIn(['Done', 'Pending', 'Not Started']).withMessage('Invalid formative two grading status'),
  body('summativeGrading').isIn(['Done', 'Pending', 'Not Started']).withMessage('Invalid summative grading status'),
  body('courseModeration').isIn(['Done', 'Pending', 'Not Started']).withMessage('Invalid course moderation status'),
  body('intranetSync').isIn(['Done', 'Pending', 'Not Started']).withMessage('Invalid intranet sync status'),
  body('gradeBookStatus').isIn(['Done', 'Pending', 'Not Started']).withMessage('Invalid gradebook status')
];

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.get('/', authorizeManagerOrFacilitator, activityTrackerController.getAllActivityTrackers);
router.get('/my', activityTrackerController.getMyActivityTrackers);
router.get('/:id', authorizeManagerOrFacilitator, activityTrackerController.getActivityTrackerById);
router.get('/facilitator/:facilitatorId', authorizeManagerOrFacilitator, activityTrackerController.getActivityTrackersByFacilitator);
router.get('/course/:allocationId', authorizeManagerOrFacilitator, activityTrackerController.getActivityTrackersByCourseOffering);

// CRUD operations
router.post('/', authorizeManagerOrFacilitator, validateActivityTracker, activityTrackerController.createActivityTracker);
router.put('/:id', authorizeManagerOrFacilitator, validateActivityTracker, activityTrackerController.updateActivityTracker);
router.delete('/:id', authorizeManagerOrFacilitator, activityTrackerController.deleteActivityTracker);

module.exports = router; 