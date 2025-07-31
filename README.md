# Course Management Platform Backend Service

A comprehensive backend system for Course Management Platform with role-based access, Redis queuing, and i18n support. T

## 🚀 Features

### Module 1: Course Allocation System
- **Role-based Access Control**: Managers can assign modules to facilitators, facilitators can only view their assigned courses
- **CRUD Operations**: Complete CRUD for Modules, Classes, Students, Facilitators, and Course Offerings
- **Advanced Filtering**: Filter course offerings by trimester, cohort, intake, facilitator, and mode
- **Data Validation**: Comprehensive input validation and relationship constraints

### Module 2: Facilitator Activity Tracker (FAT)
- **Weekly Activity Logs**: Facilitators can submit and update weekly activity logs
- **Status Tracking**: Track attendance, grading, moderation, intranet sync, and gradebook status
- **Redis-backed Notifications**: Automated email notifications using Redis queuing system
- **Nodemailer Integration**: Real email notifications for managers and facilitators
- **Weekly Reminders**: Automated reminders for missing logs and overdue submissions

### Module 3: Student Reflection Page with i18n/l10n
- **Multilingual Support**: English, French, and Spanish
- **Dynamic Language Switching**: Real-time language switching without page reload
- **Responsive Design**: Modern, mobile-friendly interface
- **Form Validation**: Client-side validation with user feedback
- **Auto-save**: Automatic draft saving to prevent data loss

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT with bcrypt password hashing
- **Caching & Queuing**: Redis
- **Email**: Nodemailer with Gmail SMTP
- **Testing**: Jest with Supertest
- **Documentation**: Swagger/OpenAPI
- **Frontend**: HTML, CSS, JavaScript (Vanilla)

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Redis (v6.0 or higher)
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd coursemanagementplatform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
PORT=

# MySQL Configuration
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# JWT Configuration
JWT_SECRET=secretkey

# Redis Configuration
REDIS_HOST=
REDIS_PORT=

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
```

### 4. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE course_management_platform;
```

### 5. Start Services
```bash
# Start Redis (if not running as a service)
redis-server

# Start MySQL (if not running as a service)
# On Windows: Start MySQL service
# On macOS: brew services start mysql
# On Linux: sudo systemctl start mysql
```

### 6. Run the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Swagger Documentation
Access the interactive API documentation at: `http://localhost:3000/api-docs`

### Health Check
Check if the API is running: `http://localhost:3000/health`

## 🔐 Authentication

### Login Endpoints
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/register` - User registration
- **GET** `/api/auth/profile` - Get user profile

### Role-based Access
- **Managers**: Full access to all CRUD operations
- **Facilitators**: Limited access to their assigned courses and activity logs

## 📊 Database Schema

### Core Entities
- **Managers**: Academic managers who assign facilitators to courses
- **Facilitators**: Course instructors with assigned modules
- **Modules**: Academic courses with half-semester designation
- **Classes**: Academic classes with trimester and year information
- **Students**: Enrolled students with class and cohort associations
- **Cohorts**: Student groups
- **Modes**: Course delivery modes (online, in-person, hybrid)
- **Course Offerings**: Course allocations linking modules, classes, and facilitators
- **Activity Trackers**: Weekly activity logs for facilitators


## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
The project includes comprehensive tests for:
- Authentication endpoints
- Module CRUD operations
- Class management
- Student operations
- Facilitator management
- Course offering operations
- Activity tracker functionality
- Utility functions

## 📧 Email Notifications

### Notification Types
1. **Activity Log Submission**: Notifies managers when facilitators submit logs
2. **Weekly Reminders**: Sends reminders to facilitators for missing logs
3. **Overdue Notifications**: Alerts managers about overdue submissions

### Email Configuration
The system uses Gmail SMTP for sending emails. Configure your email settings in the `.env` file.

## 🌐 Frontend (Module 3)

### Student Reflection Page
- **URL**: `https://coursemanagementfrontend.netlify.app/`
- **Features**:
  - Multilingual support (English, French, Spanish)
  - Dynamic language switching
  - Form validation
  - Auto-save functionality
  - Responsive design


## 📁 Project Structure

```
coursemanagementplatform/
├── config/
│   ├── database.js
│   ├── redis.js
│   └── email.js
├── controllers/
│   ├── authController.js
│   ├── moduleController.js
│   ├── classController.js
│   ├── studentController.js
│   ├── facilitatorController.js
│   ├── courseOfferingController.js
│   └── activityTrackerController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── index.js
│   ├── Manager.js
│   ├── Module.js
│   ├── Cohort.js
│   ├── Class.js
│   ├── Student.js
│   ├── Facilitator.js
│   ├── Mode.js
│   ├── CourseOffering.js
│   └── ActivityTracker.js
├── routes/
│   ├── auth.js
│   ├── modules.js
│   ├── classes.js
│   ├── students.js
│   ├── facilitators.js
│   ├── courseOfferings.js
│   └── activityTrackers.js
├── services/
│   └── notificationService.js
├── tests/
│   ├── auth.test.js
│   ├── modules.test.js
│   └── ... (additional test files)
├── utils/
│   ├── jwt.js
│   └── databaseSeeder.js
├── frontend/
│   ├── index.html
│   ├── translations.js
│   └── script.js
├── seeders/
│   └── seedData.js
├── server.js
├── package.json
└── README.md
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with nodemon

# Production
npm start           # Start production server

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode

# Database
npm run db:migrate  # Run database migrations
npm run db:seed     # Seed database with initial data
npm run db:reset    # Reset database (drop, create, migrate, seed)
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Modules
- `GET /api/modules` - Get all modules
- `GET /api/modules/:id` - Get module by ID
- `POST /api/modules` - Create new module
- `PUT /api/modules/:id` - Update module
- `DELETE /api/modules/:id` - Delete module
- `GET /api/modules/half/:half` - Get modules by half

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `GET /api/classes/year/:year` - Get classes by year
- `GET /api/classes/trimester/:trimester` - Get classes by trimester

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/class/:classId` - Get students by class
- `GET /api/students/cohort/:cohortId` - Get students by cohort

### Facilitators
- `GET /api/facilitators` - Get all facilitators
- `GET /api/facilitators/:id` - Get facilitator by ID
- `POST /api/facilitators` - Create new facilitator
- `PUT /api/facilitators/:id` - Update facilitator
- `DELETE /api/facilitators/:id` - Delete facilitator
- `GET /api/facilitators/manager/:managerId` - Get facilitators by manager
- `GET /api/facilitators/:id/courses` - Get facilitator's courses

### Course Offerings
- `GET /api/course-offerings` - Get all course offerings
- `GET /api/course-offerings/:id` - Get course offering by ID
- `POST /api/course-offerings` - Create new course offering
- `PUT /api/course-offerings/:id` - Update course offering
- `DELETE /api/course-offerings/:id` - Delete course offering
- `GET /api/course-offerings/filter` - Filter course offerings
- `GET /api/course-offerings/facilitator/:facilitatorId` - Get by facilitator

### Activity Trackers
- `GET /api/activity-trackers` - Get all activity trackers
- `GET /api/activity-trackers/my` - Get current user's activity trackers
- `GET /api/activity-trackers/:id` - Get activity tracker by ID
- `POST /api/activity-trackers` - Create new activity tracker
- `PUT /api/activity-trackers/:id` - Update activity tracker
- `DELETE /api/activity-trackers/:id` - Delete activity tracker
- `GET /api/activity-trackers/facilitator/:facilitatorId` - Get by facilitator
- `GET /api/activity-trackers/course/:allocationId` - Get by course offering

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security

## 📞 Support

For questions or support, please contact:
- **Email**: y.molumo@alustudent.com

## 📄 License

This project is licensed under the MIT License.

## 🎥 Video Walkthrough

A comprehensive video walkthrough demonstrating all API endpoints and functionality is available at: [Video Link - To be added]

## 🔗 Links

- **Frontend (Netlify)**: `https://coursemanagementfrontend.netlify.app/`
- **API Documentation**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`

---

