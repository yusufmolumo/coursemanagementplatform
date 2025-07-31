const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Manager = sequelize.define('Manager', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    role: {
      type: DataTypes.ENUM('manager'),
      defaultValue: 'manager'
    }
  }, {
    tableName: 'managers',
    timestamps: true
  });

  return Manager;
}; 