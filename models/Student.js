const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Student = sequelize.define('Student', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
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
    cohortId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'cohorts',
        key: 'id'
      }
    },
    studentNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'graduated'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'students',
    timestamps: true
  });

  return Student;
}; 