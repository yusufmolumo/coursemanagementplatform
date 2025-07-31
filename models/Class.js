const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Class = sequelize.define('Class', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 20]
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    graduationDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    trimester: {
      type: DataTypes.ENUM('January', 'May', 'September'),
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2020,
        max: 2030
      }
    }
  }, {
    tableName: 'classes',
    timestamps: true
  });

  return Class;
}; 