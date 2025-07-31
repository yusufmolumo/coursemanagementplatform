const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const CourseOffering = sequelize.define('CourseOffering', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    moduleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'modules',
        key: 'id'
      }
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id'
      }
    },
    facilitatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'facilitators',
        key: 'id'
      }
    },
    trimester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 3
      }
    },
    modeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'modes',
        key: 'id'
      }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2020,
        max: 2030
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'completed'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'course_offerings',
    timestamps: true,
    indexes: [
      {
        name: 'unique_course_offering',
        unique: true,
        fields: ['moduleId', 'classId', 'facilitatorId', 'trimester', 'year']
      }
    ]
  });

  return CourseOffering;
};