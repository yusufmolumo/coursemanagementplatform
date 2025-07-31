const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const seedData = {
  managers: [
    {
      id: uuidv4(),
      name: 'Binusha',
      email: 'y.molumo@alustudent.com',
      password: bcrypt.hashSync('password123', 10),
      role: 'manager'
    }
  ],
  
  modes: [
    {
      id: uuidv4(),
      name: 'online',
      description: 'Fully online course delivery'
    },
    {
      id: uuidv4(),
      name: 'in-person',
      description: 'Traditional classroom-based delivery'
    },
    {
      id: uuidv4(),
      name: 'hybrid',
      description: 'Combination of online and in-person delivery'
    }
  ],
  
  cohorts: [
    {
      id: uuidv4(),
      name: 'cohort1',
      description: 'First cohort of students'
    },
    {
      id: uuidv4(),
      name: 'cohort2',
      description: 'Second cohort of students'
    },
    {
      id: uuidv4(),
      name: 'cohort3',
      description: 'Third cohort of students'
    },
    {
      id: uuidv4(),
      name: 'cohort4',
      description: 'Fourth cohort of students'
    },
    {
      id: uuidv4(),
      name: 'cohort5',
      description: 'Fifth cohort of students'
    }
  ],
  
  modules: [
    {
      id: uuidv4(),
      name: 'Advanced Backend',
      half: 'H1',
      description: 'Advanced backend development concepts',
      credits: 15
    },
    {
      id: uuidv4(),
      name: 'Database Management',
      half: 'H1',
      description: 'Database design and management',
      credits: 12
    },
    {
      id: uuidv4(),
      name: 'Web Development',
      half: 'H2',
      description: 'Modern web development practices',
      credits: 18
    },
    {
      id: uuidv4(),
      name: 'Software Engineering',
      half: 'H2',
      description: 'Software engineering principles and practices',
      credits: 20
    }
  ],
  
  classes: [
    {
      id: uuidv4(),
      name: '2024J',
      startDate: new Date('2024-01-15'),
      graduationDate: new Date('2024-04-30'),
      trimester: 'January',
      year: 2024
    },
    {
      id: uuidv4(),
      name: '2024M',
      startDate: new Date('2024-05-13'),
      graduationDate: new Date('2024-08-30'),
      trimester: 'May',
      year: 2024
    },
    {
      id: uuidv4(),
      name: '2024S',
      startDate: new Date('2024-09-14'),
      graduationDate: new Date('2024-12-30'),
      trimester: 'September',
      year: 2024
    },
    {
      id: uuidv4(),
      name: '2025J',
      startDate: new Date('2025-01-13'),
      graduationDate: new Date('2025-04-30'),
      trimester: 'January',
      year: 2025
    },
    {
      id: uuidv4(),
      name: '2025M',
      startDate: new Date('2025-05-12'),
      graduationDate: new Date('2025-08-30'),
      trimester: 'May',
      year: 2025
    },
    {
      id: uuidv4(),
      name: '2025S',
      startDate: new Date('2025-09-15'),
      graduationDate: new Date('2025-12-30'),
      trimester: 'September',
      year: 2025
    }
  ]
};

module.exports = seedData; 