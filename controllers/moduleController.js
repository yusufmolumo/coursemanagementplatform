const db = require('../models');

// Get all modules
const getAllModules = async (req, res) => {
  try {
    const modules = await db.Module.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: modules
    });
  } catch (error) {
    console.error('Get all modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get module by ID
const getModuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const module = await db.Module.findByPk(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.json({
      success: true,
      data: module
    });
  } catch (error) {
    console.error('Get module by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new module
const createModule = async (req, res) => {
  try {
    const { name, half, description, credits } = req.body;

    // Check if module with same name already exists
    const existingModule = await db.Module.findOne({ where: { name } });
    if (existingModule) {
      return res.status(400).json({
        success: false,
        message: 'Module with this name already exists'
      });
    }

    const module = await db.Module.create({
      name,
      half,
      description,
      credits
    });

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: module
    });
  } catch (error) {
    console.error('Create module error:', error);
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

// Update module
const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, half, description, credits } = req.body;

    const module = await db.Module.findByPk(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check if name is being changed and if it conflicts with existing module
    if (name && name !== module.name) {
      const existingModule = await db.Module.findOne({ where: { name } });
      if (existingModule) {
        return res.status(400).json({
          success: false,
          message: 'Module with this name already exists'
        });
      }
    }

    await module.update({
      name: name || module.name,
      half: half || module.half,
      description: description !== undefined ? description : module.description,
      credits: credits !== undefined ? credits : module.credits
    });

    res.json({
      success: true,
      message: 'Module updated successfully',
      data: module
    });
  } catch (error) {
    console.error('Update module error:', error);
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

// Delete module
const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    const module = await db.Module.findByPk(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check if module is being used in course offerings
    const courseOfferings = await db.CourseOffering.findAll({
      where: { moduleId: id }
    });

    if (courseOfferings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete module. It is being used in course offerings.'
      });
    }

    await module.destroy();

    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get modules by half
const getModulesByHalf = async (req, res) => {
  try {
    const { half } = req.params;

    const modules = await db.Module.findAll({
      where: { half },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: modules
    });
  } catch (error) {
    console.error('Get modules by half error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  getModulesByHalf
}; 