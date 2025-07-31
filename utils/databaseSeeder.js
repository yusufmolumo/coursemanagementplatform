const db = require('../models');
const seedData = require('../seeders/seedData');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Seed Managers
    console.log('Seeding managers...');
    for (const manager of seedData.managers) {
      await db.Manager.findOrCreate({
        where: { email: manager.email },
        defaults: manager
      });
    }

    // Seed Modes
    console.log('Seeding modes...');
    for (const mode of seedData.modes) {
      await db.Mode.findOrCreate({
        where: { name: mode.name },
        defaults: mode
      });
    }

    // Seed Cohorts
    console.log('Seeding cohorts...');
    for (const cohort of seedData.cohorts) {
      await db.Cohort.findOrCreate({
        where: { name: cohort.name },
        defaults: cohort
      });
    }

    // Seed Modules
    console.log('Seeding modules...');
    for (const module of seedData.modules) {
      await db.Module.findOrCreate({
        where: { name: module.name },
        defaults: module
      });
    }

    // Seed Classes
    console.log('Seeding classes...');
    for (const classItem of seedData.classes) {
      await db.Class.findOrCreate({
        where: { name: classItem.name },
        defaults: classItem
      });
    }

    // Get the first manager to create facilitators
    const manager = await db.Manager.findOne();
    if (manager) {
      // Seed Facilitators
      console.log('Seeding facilitators...');
      const facilitators = [
        {
          id: uuidv4(),
          email: 'ykmolumo@gmail.com',
          name: 'John Doe',
          qualification: 'Masters in Computer Science',
          location: 'Kigali',
          managerId: manager.id,
          password: bcrypt.hashSync('password123', 10),
          role: 'facilitator'
        },
        {
          id: uuidv4(),
          email: 'facilitator2@example.com',
          name: 'Jane Smith',
          qualification: 'PhD in Software Engineering',
          location: 'Nairobi',
          managerId: manager.id,
          password: bcrypt.hashSync('password123', 10),
          role: 'facilitator'
        }
      ];

      for (const facilitator of facilitators) {
        await db.Facilitator.findOrCreate({
          where: { email: facilitator.email },
          defaults: facilitator
        });
      }

      // Get some data for creating students and course offerings
      const cohort = await db.Cohort.findOne();
      const classItem = await db.Class.findOne();
      const module = await db.Module.findOne();
      const mode = await db.Mode.findOne();
      const facilitator = await db.Facilitator.findOne();

      if (cohort && classItem && module && mode && facilitator) {
        // Seed Students
        console.log('Seeding students...');
        const students = [
          {
            id: uuidv4(),
            email: 'ben@alustudent.com',
            name: 'Ben',
            classId: classItem.id,
            cohortId: cohort.id,
            studentNumber: 'STU001'
          },
          {
            id: uuidv4(),
            email: 'alice@alustudent.com',
            name: 'Alice Johnson',
            classId: classItem.id,
            cohortId: cohort.id,
            studentNumber: 'STU002'
          }
        ];

        for (const student of students) {
          await db.Student.findOrCreate({
            where: { email: student.email },
            defaults: student
          });
        }

        // Seed Course Offerings
        console.log('Seeding course offerings...');
        const courseOffering = {
          id: uuidv4(),
          moduleId: module.id,
          classId: classItem.id,
          facilitatorId: facilitator.id,
          trimester: 1,
          modeId: mode.id,
          year: 2025
        };

        await db.CourseOffering.findOrCreate({
          where: {
            moduleId: courseOffering.moduleId,
            classId: courseOffering.classId,
            facilitatorId: courseOffering.facilitatorId,
            trimester: courseOffering.trimester,
            year: courseOffering.year
          },
          defaults: courseOffering
        });
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = { seedDatabase }; 