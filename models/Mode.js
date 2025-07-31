const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Mode = sequelize.define('Mode', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.ENUM('online', 'in-person', 'hybrid'),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'modes',
    timestamps: true
  });

  return Mode;
}; 