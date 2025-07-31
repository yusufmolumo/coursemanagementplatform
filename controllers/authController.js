const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const db = require('../models');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists as manager
    let user = await db.Manager.findOne({ where: { email } });
    let role = 'manager';

    // If not found as manager, check as facilitator
    if (!user) {
      user = await db.Facilitator.findOne({ where: { email } });
      role = 'facilitator';
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: role
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, qualification, location, managerId } = req.body;

    // Check if user already exists
    const existingManager = await db.Manager.findOne({ where: { email } });
    const existingFacilitator = await db.Facilitator.findOne({ where: { email } });

    if (existingManager || existingFacilitator) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;

    if (role === 'manager') {
      user = await db.Manager.create({
        name,
        email,
        password: hashedPassword,
        role
      });
    } else if (role === 'facilitator') {
      if (!managerId) {
        return res.status(400).json({
          success: false,
          message: 'Manager ID is required for facilitators'
        });
      }

      user = await db.Facilitator.create({
        name,
        email,
        password: hashedPassword,
        role,
        qualification,
        location,
        managerId
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let user;

    if (userRole === 'manager') {
      user = await db.Manager.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
    } else {
      user = await db.Facilitator.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: db.Manager,
            as: 'manager',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  login,
  register,
  getProfile
}; 