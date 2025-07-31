const db = require('../models');
const notificationService = require('../services/notificationService');
const moment = require('moment');

// Get all activity trackers
const getAllActivityTrackers = async (req, res) => {
  try {
    const activityTrackers = await db.ActivityTracker.findAll({
      include: [
        {
          model: db.CourseOffering,
          as: 'courseOffering',
          include: [
            { model: db.Module, as: 'module' },
            { model: db.Class, as: 'class' },
            { model: db.Facilitator, as: 'facilitator' },
            { model: db.Mode, as: 'mode' }
          ]
        }
      ],
      order: [['weekNumber', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: activityTrackers
    });
  } catch (error) {
    console.error('Get all activity trackers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get activity tracker by ID
const getActivityTrackerById = async (req, res) => {
  try {
    const { id } = req.params;

    const activityTracker = await db.ActivityTracker.findByPk(id, {
      include: [
        {
          model: db.CourseOffering,
          as: 'courseOffering',
          include: [
            { model: db.Module, as: 'module' },
            { model: db.Class, as: 'class' },
            { model: db.Facilitator, as: 'facilitator' },
            { model: db.Mode, as: 'mode' }
          ]
        }
      ]
    });

    if (!activityTracker) {
      return res.status(404).json({
        success: false,
        message: 'Activity tracker not found'
      });
    }

    res.json({
      success: true,
      data: activityTracker
    });
  } catch (error) {
    console.error('Get activity tracker by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new activity tracker
const createActivityTracker = async (req, res) => {
  try {
    const {
      allocationId,
      weekNumber,
      attendance,
      formativeOneGrading,
      formativeTwoGrading,
      summativeGrading,
      courseModeration,
      intranetSync,
      gradeBookStatus,
      notes
    } = req.body;

    // Check if activity tracker already exists for this allocation and week
    const existingTracker = await db.ActivityTracker.findOne({
      where: {
        allocationId,
        weekNumber
      }
    });

    if (existingTracker) {
      return res.status(400).json({
        success: false,
        message: 'Activity tracker already exists for this allocation and week'
      });
    }

    // Verify course offering exists
    const courseOffering = await db.CourseOffering.findByPk(allocationId);
    if (!courseOffering) {
      return res.status(400).json({
        success: false,
        message: 'Course offering not found'
      });
    }

    // Check if user is the assigned facilitator
    if (req.user.role === 'facilitator' && courseOffering.facilitatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only create activity trackers for your assigned courses'
      });
    }

    const activityTracker = await db.ActivityTracker.create({
      allocationId,
      weekNumber,
      attendance,
      formativeOneGrading,
      formativeTwoGrading,
      summativeGrading,
      courseModeration,
      intranetSync,
      gradeBookStatus,
      notes,
      submissionDate: new Date()
    });

    // Fetch the created activity tracker with associations
    const createdTracker = await db.ActivityTracker.findByPk(activityTracker.id, {
      include: [
        {
          model: db.CourseOffering,
          as: 'courseOffering',
          include: [
            { model: db.Module, as: 'module' },
            { model: db.Class, as: 'class' },
            { model: db.Facilitator, as: 'facilitator' },
            { model: db.Mode, as: 'mode' }
          ]
        }
      ]
    });

    // Send notification to manager
    await notificationService.addToQueue({
      type: 'activity_log_submitted',
      facilitatorId: courseOffering.facilitatorId,
      courseOfferingId: allocationId,
      weekNumber: weekNumber
    });

    res.status(201).json({
      success: true,
      message: 'Activity tracker created successfully',
      data: createdTracker
    });
  } catch (error) {
    console.error('Create activity tracker error:', error);
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

// Update activity tracker
const updateActivityTracker = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      attendance,
      formativeOneGrading,
      formativeTwoGrading,
      summativeGrading,
      courseModeration,
      intranetSync,
      gradeBookStatus,
      notes
    } = req.body;

    const activityTracker = await db.ActivityTracker.findByPk(id, {
      include: [
        {
          model: db.CourseOffering,
          as: 'courseOffering'
        }
      ]
    });

    if (!activityTracker) {
      return res.status(404).json({
        success: false,
        message: 'Activity tracker not found'
      });
    }

    // Check if user is the assigned facilitator
    if (req.user.role === 'facilitator' && activityTracker.courseOffering.facilitatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update activity trackers for your assigned courses'
      });
    }

    await activityTracker.update({
      attendance: attendance || activityTracker.attendance,
      formativeOneGrading: formativeOneGrading || activityTracker.formativeOneGrading,
      formativeTwoGrading: formativeTwoGrading || activityTracker.formativeTwoGrading,
      summativeGrading: summativeGrading || activityTracker.summativeGrading,
      courseModeration: courseModeration || activityTracker.courseModeration,
      intranetSync: intranetSync || activityTracker.intranetSync,
      gradeBookStatus: gradeBookStatus || activityTracker.gradeBookStatus,
      notes: notes !== undefined ? notes : activityTracker.notes,
      submissionDate: new Date()
    });

    // Fetch the updated activity tracker with associations
    const updatedTracker = await db.ActivityTracker.findByPk(id, {
      include: [
        {
          model: db.CourseOffering,
          as: 'courseOffering',
          include: [
            { model: db.Module, as: 'module' },
            { model: db.Class, as: 'class' },
            { model: db.Facilitator, as: 'facilitator' },
            { model: db.Mode, as: 'mode' }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Activity tracker updated successfully',
      data: updatedTracker
    });
  } catch (error) {
    console.error('Update activity tracker error:', error);
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

// Delete activity tracker
const deleteActivityTracker = async (req, res) => {
  try {
    const { id } = req.params;

    const activityTracker = await db.ActivityTracker.findByPk(id, {
      include: [
        {
          model: db.CourseOffering,
          as: 'courseOffering'
        }
      ]
    });

    if (!activityTracker) {
      return res.status(404).json({
        success: false,
        message: 'Activity tracker not found'
      });
    }

    // Check if user is the assigned facilitator
    if (req.user.role === 'facilitator' && activityTracker.courseOffering.facilitatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete activity trackers for your assigned courses'
      });
    }

    await activityTracker.destroy();

    res.json({
      success: true,
      message: 'Activity tracker deleted successfully'
    });
  } catch (error) {
    console.error('Delete activity tracker error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get activity trackers by facilitator
const getActivityTrackersByFacilitator = async (req, res) => {
  try {
    const { facilitatorId } = req.params;
    const { week, status } = req.query;

    const whereClause = {};
    const includeClause = [
      {
        model: db.CourseOffering,
        as: 'courseOffering',
        where: { facilitatorId },
        include: [
          { model: db.Module, as: 'module' },
          { model: db.Class, as: 'class' },
          { model: db.Facilitator, as: 'facilitator' },
          { model: db.Mode, as: 'mode' }
        ]
      }
    ];

    if (week) whereClause.weekNumber = week;
    if (status) {
      whereClause[db.Sequelize.Op.or] = [
        { formativeOneGrading: status },
        { formativeTwoGrading: status },
        { summativeGrading: status },
        { courseModeration: status },
        { intranetSync: status },
        { gradeBookStatus: status }
      ];
    }

    const activityTrackers = await db.ActivityTracker.findAll({
      where: whereClause,
      include: includeClause,
      order: [['weekNumber', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: activityTrackers
    });
  } catch (error) {
    console.error('Get activity trackers by facilitator error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get activity trackers by course offering
const getActivityTrackersByCourseOffering = async (req, res) => {
  try {
    const { allocationId } = req.params;
    const { week, status } = req.query;

    const whereClause = { allocationId };
    const includeClause = [
      {
        model: db.CourseOffering,
        as: 'courseOffering',
        include: [
          { model: db.Module, as: 'module' },
          { model: db.Class, as: 'class' },
          { model: db.Facilitator, as: 'facilitator' },
          { model: db.Mode, as: 'mode' }
        ]
      }
    ];

    if (week) whereClause.weekNumber = week;
    if (status) {
      whereClause[db.Sequelize.Op.or] = [
        { formativeOneGrading: status },
        { formativeTwoGrading: status },
        { summativeGrading: status },
        { courseModeration: status },
        { intranetSync: status },
        { gradeBookStatus: status }
      ];
    }

    const activityTrackers = await db.ActivityTracker.findAll({
      where: whereClause,
      include: includeClause,
      order: [['weekNumber', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: activityTrackers
    });
  } catch (error) {
    console.error('Get activity trackers by course offering error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user's activity trackers
const getMyActivityTrackers = async (req, res) => {
  try {
    const { week, status } = req.query;
    const userId = req.user.id;

    const whereClause = {};
    const includeClause = [
      {
        model: db.CourseOffering,
        as: 'courseOffering',
        where: { facilitatorId: userId },
        include: [
          { model: db.Module, as: 'module' },
          { model: db.Class, as: 'class' },
          { model: db.Facilitator, as: 'facilitator' },
          { model: db.Mode, as: 'mode' }
        ]
      }
    ];

    if (week) whereClause.weekNumber = week;
    if (status) {
      whereClause[db.Sequelize.Op.or] = [
        { formativeOneGrading: status },
        { formativeTwoGrading: status },
        { summativeGrading: status },
        { courseModeration: status },
        { intranetSync: status },
        { gradeBookStatus: status }
      ];
    }

    const activityTrackers = await db.ActivityTracker.findAll({
      where: whereClause,
      include: includeClause,
      order: [['weekNumber', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: activityTrackers
    });
  } catch (error) {
    console.error('Get my activity trackers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllActivityTrackers,
  getActivityTrackerById,
  createActivityTracker,
  updateActivityTracker,
  deleteActivityTracker,
  getActivityTrackersByFacilitator,
  getActivityTrackersByCourseOffering,
  getMyActivityTrackers
}; 