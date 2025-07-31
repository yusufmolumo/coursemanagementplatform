const db = require('../models');
const bcrypt = require('bcryptjs');

// Get all facilitators
const getAllFacilitators = async (req, res) => {
  try {
    const facilitators = await db.Facilitator.findAll({
      include: [
        { model: db.Manager, as: 'manager', attributes: ['id', 'name', 'email'] }
      ],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: facilitators
    });
  } catch (error) {
    console.error('Get all facilitators error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get facilitator by ID
const getFacilitatorById = async (req, res) => {
  try {
    const { id } = req.params;

    const facilitator = await db.Facilitator.findByPk(id, {
      include: [
        { model: db.Manager, as: 'manager', attributes: ['id', 'name', 'email'] },
        {
          model: db.CourseOffering,
          as: 'courseOfferings',
          include: [
            { model: db.Module, as: 'module' },
            { model: db.Class, as: 'class' },
            { model: db.Mode, as: 'mode' }
          ]
        }
      ]
    });

    if (!facilitator) {
      return res.status(404).json({
        success: false,
        message: 'Facilitator not found'
      });
    }

    res.json({
      success: true,
      data: facilitator
    });
  } catch (error) {
    console.error('Get facilitator by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new facilitator
const createFacilitator = async (req, res) => {
  try {
    const { email, name, qualification, location, managerId, password } = req.body;

    // Check if facilitator with same email already exists
    const existingFacilitator = await db.Facilitator.findOne({ where: { email } });
    if (existingFacilitator) {
      return res.status(400).json({
        success: false,
        message: 'Facilitator with this email already exists'
      });
    }

    // Verify manager exists
    const manager = await db.Manager.findByPk(managerId);
    if (!manager) {
      return res.status(400).json({
        success: false,
        message: 'Manager not found'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const facilitator = await db.Facilitator.create({
      email,
      name,
      qualification,
      location,
      managerId,
      password: hashedPassword,
      role: 'facilitator'
    });

    // Fetch the created facilitator with associations
    const createdFacilitator = await db.Facilitator.findByPk(facilitator.id, {
      include: [
        { model: db.Manager, as: 'manager', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Facilitator created successfully',
      data: createdFacilitator
    });
  } catch (error) {
    console.error('Create facilitator error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update facilitator
const updateFacilitator = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, qualification, location, managerId, password, status } = req.body;

    const facilitator = await db.Facilitator.findByPk(id);
    if (!facilitator) {
      return res.status(404).json({
        success: false,
        message: 'Facilitator not found'
      });
    }

    // Check if email is being changed and if it conflicts with existing facilitator
    if (email && email !== facilitator.email) {
      const existingFacilitator = await db.Facilitator.findOne({ where: { email } });
      if (existingFacilitator) {
        return res.status(400).json({
          success: false,
          message: 'Facilitator with this email already exists'
        });
      }
    }

    // Verify manager exists if being updated
    if (managerId) {
      const manager = await db.Manager.findByPk(managerId);
      if (!manager) {
        return res.status(400).json({
          success: false,
          message: 'Manager not found'
        });
      }
    }

    // Hash password if being updated
    let hashedPassword = facilitator.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await facilitator.update({
      email: email || facilitator.email,
      name: name || facilitator.name,
      qualification: qualification || facilitator.qualification,
      location: location || facilitator.location,
      managerId: managerId || facilitator.managerId,
      password: hashedPassword,
      status: status || facilitator.status
    });

    // Fetch the updated facilitator with associations
    const updatedFacilitator = await db.Facilitator.findByPk(id, {
      include: [
        { model: db.Manager, as: 'manager', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({
      success: true,
      message: 'Facilitator updated successfully',
      data: updatedFacilitator
    });
  } catch (error) {
    console.error('Update facilitator error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete facilitator
const deleteFacilitator = async (req, res) => {
  try {
    const { id } = req.params;

    const facilitator = await db.Facilitator.findByPk(id);
    if (!facilitator) {
      return res.status(404).json({
        success: false,
        message: 'Facilitator not found'
      });
    }

    // Check if facilitator has course offerings
    const courseOfferings = await db.CourseOffering.findAll({
      where: { facilitatorId: id }
    });

    if (courseOfferings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete facilitator. They have active course offerings.'
      });
    }

    await facilitator.destroy();

    res.json({
      success: true,
      message: 'Facilitator deleted successfully'
    });
  } catch (error) {
    console.error('Delete facilitator error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get facilitators by manager
const getFacilitatorsByManager = async (req, res) => {
  try {
    const { managerId } = req.params;

    const facilitators = await db.Facilitator.findAll({
      where: { managerId },
      include: [
        { model: db.Manager, as: 'manager', attributes: ['id', 'name', 'email'] }
      ],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: facilitators
    });
  } catch (error) {
    console.error('Get facilitators by manager error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get facilitator's assigned courses
const getFacilitatorCourses = async (req, res) => {
  try {
    const { id } = req.params;

    const facilitator = await db.Facilitator.findByPk(id, {
      include: [
        {
          model: db.CourseOffering,
          as: 'courseOfferings',
          include: [
            { model: db.Module, as: 'module' },
            { model: db.Class, as: 'class' },
            { model: db.Mode, as: 'mode' }
          ]
        }
      ]
    });

    if (!facilitator) {
      return res.status(404).json({
        success: false,
        message: 'Facilitator not found'
      });
    }

    res.json({
      success: true,
      data: facilitator.courseOfferings
    });
  } catch (error) {
    console.error('Get facilitator courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllFacilitators,
  getFacilitatorById,
  createFacilitator,
  updateFacilitator,
  deleteFacilitator,
  getFacilitatorsByManager,
  getFacilitatorCourses
}; 