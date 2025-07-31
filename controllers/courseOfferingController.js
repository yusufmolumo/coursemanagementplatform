const db = require('../models');

// Get all course offerings
const getAllCourseOfferings = async (req, res) => {
  try {
    const courseOfferings = await db.CourseOffering.findAll({
      include: [
        { model: db.Module, as: 'module' },
        { model: db.Class, as: 'class' },
        { model: db.Facilitator, as: 'facilitator' },
        { model: db.Mode, as: 'mode' }
      ],
      order: [['year', 'DESC'], ['trimester', 'ASC']]
    });

    res.json({
      success: true,
      data: courseOfferings
    });
  } catch (error) {
    console.error('Get all course offerings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get course offering by ID
const getCourseOfferingById = async (req, res) => {
  try {
    const { id } = req.params;

    const courseOffering = await db.CourseOffering.findByPk(id, {
      include: [
        { model: db.Module, as: 'module' },
        { model: db.Class, as: 'class' },
        { model: db.Facilitator, as: 'facilitator' },
        { model: db.Mode, as: 'mode' }
      ]
    });

    if (!courseOffering) {
      return res.status(404).json({
        success: false,
        message: 'Course offering not found'
      });
    }

    res.json({
      success: true,
      data: courseOffering
    });
  } catch (error) {
    console.error('Get course offering by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new course offering
const createCourseOffering = async (req, res) => {
  try {
    const { moduleId, classId, facilitatorId, trimester, modeId, year } = req.body;

    // Check if course offering already exists
    const existingOffering = await db.CourseOffering.findOne({
      where: {
        moduleId,
        classId,
        facilitatorId,
        trimester,
        year
      }
    });

    if (existingOffering) {
      return res.status(400).json({
        success: false,
        message: 'Course offering already exists for this combination'
      });
    }

    // Verify module exists
    const module = await db.Module.findByPk(moduleId);
    if (!module) {
      return res.status(400).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Verify class exists
    const classItem = await db.Class.findByPk(classId);
    if (!classItem) {
      return res.status(400).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Verify facilitator exists
    const facilitator = await db.Facilitator.findByPk(facilitatorId);
    if (!facilitator) {
      return res.status(400).json({
        success: false,
        message: 'Facilitator not found'
      });
    }

    // Verify mode exists
    const mode = await db.Mode.findByPk(modeId);
    if (!mode) {
      return res.status(400).json({
        success: false,
        message: 'Mode not found'
      });
    }

    const courseOffering = await db.CourseOffering.create({
      moduleId,
      classId,
      facilitatorId,
      trimester,
      modeId,
      year
    });

    // Fetch the created course offering with associations
    const createdOffering = await db.CourseOffering.findByPk(courseOffering.id, {
      include: [
        { model: db.Module, as: 'module' },
        { model: db.Class, as: 'class' },
        { model: db.Facilitator, as: 'facilitator' },
        { model: db.Mode, as: 'mode' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Course offering created successfully',
      data: createdOffering
    });
  } catch (error) {
    console.error('Create course offering error:', error);
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

// Update course offering
const updateCourseOffering = async (req, res) => {
  try {
    const { id } = req.params;
    const { moduleId, classId, facilitatorId, trimester, modeId, year, status } = req.body;

    const courseOffering = await db.CourseOffering.findByPk(id);
    if (!courseOffering) {
      return res.status(404).json({
        success: false,
        message: 'Course offering not found'
      });
    }

    // Check if the new combination conflicts with existing offering
    if (moduleId || classId || facilitatorId || trimester || year) {
      const newModuleId = moduleId || courseOffering.moduleId;
      const newClassId = classId || courseOffering.classId;
      const newFacilitatorId = facilitatorId || courseOffering.facilitatorId;
      const newTrimester = trimester || courseOffering.trimester;
      const newYear = year || courseOffering.year;

      const existingOffering = await db.CourseOffering.findOne({
        where: {
          moduleId: newModuleId,
          classId: newClassId,
          facilitatorId: newFacilitatorId,
          trimester: newTrimester,
          year: newYear,
          id: { [db.Sequelize.Op.ne]: id }
        }
      });

      if (existingOffering) {
        return res.status(400).json({
          success: false,
          message: 'Course offering already exists for this combination'
        });
      }
    }

    // Verify references if being updated
    if (moduleId) {
      const module = await db.Module.findByPk(moduleId);
      if (!module) {
        return res.status(400).json({
          success: false,
          message: 'Module not found'
        });
      }
    }

    if (classId) {
      const classItem = await db.Class.findByPk(classId);
      if (!classItem) {
        return res.status(400).json({
          success: false,
          message: 'Class not found'
        });
      }
    }

    if (facilitatorId) {
      const facilitator = await db.Facilitator.findByPk(facilitatorId);
      if (!facilitator) {
        return res.status(400).json({
          success: false,
          message: 'Facilitator not found'
        });
      }
    }

    if (modeId) {
      const mode = await db.Mode.findByPk(modeId);
      if (!mode) {
        return res.status(400).json({
          success: false,
          message: 'Mode not found'
        });
      }
    }

    await courseOffering.update({
      moduleId: moduleId || courseOffering.moduleId,
      classId: classId || courseOffering.classId,
      facilitatorId: facilitatorId || courseOffering.facilitatorId,
      trimester: trimester || courseOffering.trimester,
      modeId: modeId || courseOffering.modeId,
      year: year || courseOffering.year,
      status: status || courseOffering.status
    });

    // Fetch the updated course offering with associations
    const updatedOffering = await db.CourseOffering.findByPk(id, {
      include: [
        { model: db.Module, as: 'module' },
        { model: db.Class, as: 'class' },
        { model: db.Facilitator, as: 'facilitator' },
        { model: db.Mode, as: 'mode' }
      ]
    });

    res.json({
      success: true,
      message: 'Course offering updated successfully',
      data: updatedOffering
    });
  } catch (error) {
    console.error('Update course offering error:', error);
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

// Delete course offering
const deleteCourseOffering = async (req, res) => {
  try {
    const { id } = req.params;

    const courseOffering = await db.CourseOffering.findByPk(id);
    if (!courseOffering) {
      return res.status(404).json({
        success: false,
        message: 'Course offering not found'
      });
    }

    // Check if course offering has activity trackers
    const activityTrackers = await db.ActivityTracker.findAll({
      where: { allocationId: id }
    });

    if (activityTrackers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course offering. It has activity trackers associated with it.'
      });
    }

    await courseOffering.destroy();

    res.json({
      success: true,
      message: 'Course offering deleted successfully'
    });
  } catch (error) {
    console.error('Delete course offering error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Filter course offerings
const filterCourseOfferings = async (req, res) => {
  try {
    const { trimester, cohort, intake, facilitator, mode, year } = req.query;
    const whereClause = {};
    const includeClause = [
      { model: db.Module, as: 'module' },
      { model: db.Class, as: 'class' },
      { model: db.Facilitator, as: 'facilitator' },
      { model: db.Mode, as: 'mode' }
    ];

    if (trimester) whereClause.trimester = trimester;
    if (facilitator) whereClause.facilitatorId = facilitator;
    if (mode) whereClause.modeId = mode;
    if (year) whereClause.year = year;

    // Filter by class (intake)
    if (intake) {
      includeClause.push({
        model: db.Class,
        as: 'class',
        where: { name: { [db.Sequelize.Op.like]: `%${intake}%` } }
      });
    }

    // Filter by cohort (through students)
    if (cohort) {
      includeClause.push({
        model: db.Class,
        as: 'class',
        include: [{
          model: db.Student,
          as: 'students',
          include: [{
            model: db.Cohort,
            as: 'cohort',
            where: { name: { [db.Sequelize.Op.like]: `%${cohort}%` } }
          }]
        }]
      });
    }

    const courseOfferings = await db.CourseOffering.findAll({
      where: whereClause,
      include: includeClause,
      order: [['year', 'DESC'], ['trimester', 'ASC']]
    });

    res.json({
      success: true,
      data: courseOfferings
    });
  } catch (error) {
    console.error('Filter course offerings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get course offerings by facilitator
const getCourseOfferingsByFacilitator = async (req, res) => {
  try {
    const { facilitatorId } = req.params;

    const courseOfferings = await db.CourseOffering.findAll({
      where: { facilitatorId },
      include: [
        { model: db.Module, as: 'module' },
        { model: db.Class, as: 'class' },
        { model: db.Facilitator, as: 'facilitator' },
        { model: db.Mode, as: 'mode' }
      ],
      order: [['year', 'DESC'], ['trimester', 'ASC']]
    });

    res.json({
      success: true,
      data: courseOfferings
    });
  } catch (error) {
    console.error('Get course offerings by facilitator error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllCourseOfferings,
  getCourseOfferingById,
  createCourseOffering,
  updateCourseOffering,
  deleteCourseOffering,
  filterCourseOfferings,
  getCourseOfferingsByFacilitator
}; 