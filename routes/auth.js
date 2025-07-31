const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const validateRegister = [
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['manager', 'facilitator']).withMessage('Role must be either manager or facilitator')
];

// Routes
router.post('/login', validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router; 