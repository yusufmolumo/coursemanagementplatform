const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Module = sequelize.define('Module', {
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
        len: [2, 200]
      }
    },
    half: {
      type: DataTypes.ENUM('H1', 'H2'),
      allowNull: false,
      comment: 'H1 for first half, H2 for second half'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 30
      }
    }
  }, {
    tableName: 'modules',
    timestamps: true
  });

  return Module;
}; 