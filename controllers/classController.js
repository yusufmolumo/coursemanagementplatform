const db = require('../models');

// Get all classes
const getAllClasses = async (req, res) => {
  try {
    const classes = await db.Class.findAll({
      order: [['year', 'DESC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Get all classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get class by ID
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const classItem = await db.Class.findByPk(id, {
      include: [
        {
          model: db.Student,
          as: 'students',
          include: [
            { model: db.Cohort, as: 'cohort' }
          ]
        }
      ]
    });

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: classItem
    });
  } catch (error) {
    console.error('Get class by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new class
const createClass = async (req, res) => {
  try {
    const { name, startDate, graduationDate, trimester, year } = req.body;

    // Check if class with same name already exists
    const existingClass = await db.Class.findOne({ where: { name } });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Class with this name already exists'
      });
    }

    const classItem = await db.Class.create({
      name,
      startDate,
      graduationDate,
      trimester,
      year
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: classItem
    });
  } catch (error) {
    console.error('Create class error:', error);
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

// Update class
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, graduationDate, trimester, year } = req.body;

    const classItem = await db.Class.findByPk(id);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if name is being changed and if it conflicts with existing class
    if (name && name !== classItem.name) {
      const existingClass = await db.Class.findOne({ where: { name } });
      if (existingClass) {
        return res.status(400).json({
          success: false,
          message: 'Class with this name already exists'
        });
      }
    }

    await classItem.update({
      name: name || classItem.name,
      startDate: startDate || classItem.startDate,
      graduationDate: graduationDate || classItem.graduationDate,
      trimester: trimester || classItem.trimester,
      year: year || classItem.year
    });

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: classItem
    });
  } catch (error) {
    console.error('Update class error:', error);
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

// Delete class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classItem = await db.Class.findByPk(id);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if class has students
    const students = await db.Student.findAll({
      where: { classId: id }
    });

    if (students.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete class. It has students enrolled.'
      });
    }

    // Check if class is being used in course offerings
    const courseOfferings = await db.CourseOffering.findAll({
      where: { classId: id }
    });

    if (courseOfferings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete class. It is being used in course offerings.'
      });
    }

    await classItem.destroy();

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get classes by year
const getClassesByYear = async (req, res) => {
  try {
    const { year } = req.params;

    const classes = await db.Class.findAll({
      where: { year },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Get classes by year error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get classes by trimester
const getClassesByTrimester = async (req, res) => {
  try {
    const { trimester } = req.params;

    const classes = await db.Class.findAll({
      where: { trimester },
      order: [['year', 'DESC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Get classes by trimester error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassesByYear,
  getClassesByTrimester
}; 