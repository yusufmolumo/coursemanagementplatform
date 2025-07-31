const { Sequelize } = require('sequelize');
const config = require('../config/database.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Manager = require('./Manager')(sequelize, Sequelize);
db.Module = require('./Module')(sequelize, Sequelize);
db.Cohort = require('./Cohort')(sequelize, Sequelize);
db.Class = require('./Class')(sequelize, Sequelize);
db.Student = require('./Student')(sequelize, Sequelize);
db.Facilitator = require('./Facilitator')(sequelize, Sequelize);
db.Mode = require('./Mode')(sequelize, Sequelize);
db.CourseOffering = require('./CourseOffering')(sequelize, Sequelize);
db.ActivityTracker = require('./ActivityTracker')(sequelize, Sequelize);

// Define associations
db.Manager.hasMany(db.Facilitator, { foreignKey: 'managerId', as: 'facilitators' });
db.Facilitator.belongsTo(db.Manager, { foreignKey: 'managerId', as: 'manager' });

db.Class.hasMany(db.Student, { foreignKey: 'classId', as: 'students' });
db.Student.belongsTo(db.Class, { foreignKey: 'classId', as: 'class' });

db.Cohort.hasMany(db.Student, { foreignKey: 'cohortId', as: 'students' });
db.Student.belongsTo(db.Cohort, { foreignKey: 'cohortId', as: 'cohort' });

db.Module.hasMany(db.CourseOffering, { foreignKey: 'moduleId', as: 'courseOfferings' });
db.CourseOffering.belongsTo(db.Module, { foreignKey: 'moduleId', as: 'module' });

db.Class.hasMany(db.CourseOffering, { foreignKey: 'classId', as: 'courseOfferings' });
db.CourseOffering.belongsTo(db.Class, { foreignKey: 'classId', as: 'class' });

db.Facilitator.hasMany(db.CourseOffering, { foreignKey: 'facilitatorId', as: 'courseOfferings' });
db.CourseOffering.belongsTo(db.Facilitator, { foreignKey: 'facilitatorId', as: 'facilitator' });

db.Mode.hasMany(db.CourseOffering, { foreignKey: 'modeId', as: 'courseOfferings' });
db.CourseOffering.belongsTo(db.Mode, { foreignKey: 'modeId', as: 'mode' });

db.CourseOffering.hasMany(db.ActivityTracker, { foreignKey: 'allocationId', as: 'activityTrackers' });
db.ActivityTracker.belongsTo(db.CourseOffering, { foreignKey: 'allocationId', as: 'courseOffering' });

module.exports = db; 