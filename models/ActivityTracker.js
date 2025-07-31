const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const ActivityTracker = sequelize.define('ActivityTracker', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    allocationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'course_offerings',
        key: 'id'
      }
    },
    weekNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 52
      }
    },
    attendance: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of attendance status for each week'
    },
    formativeOneGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started'
    },
    formativeTwoGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started'
    },
    summativeGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started'
    },
    courseModeration: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started'
    },
    intranetSync: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started'
    },
    gradeBookStatus: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    submissionDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'activity_trackers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['allocationId', 'weekNumber']
      }
    ]
  });

  return ActivityTracker;
}; 