const db = require('../models');

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await db.Student.findAll({
      include: [
        { model: db.Class, as: 'class' },
        { model: db.Cohort, as: 'cohort' }
      ],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await db.Student.findByPk(id, {
      include: [
        { model: db.Class, as: 'class' },
        { model: db.Cohort, as: 'cohort' }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new student
const createStudent = async (req, res) => {
  try {
    const { email, name, classId, cohortId, studentNumber } = req.body;

    // Check if student with same email already exists
    const existingStudent = await db.Student.findOne({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }

    // Check if student number is provided and unique
    if (studentNumber) {
      const existingStudentNumber = await db.Student.findOne({ where: { studentNumber } });
      if (existingStudentNumber) {
        return res.status(400).json({
          success: false,
          message: 'Student with this student number already exists'
        });
      }
    }

    // Verify class exists
    const classItem = await db.Class.findByPk(classId);
    if (!classItem) {
      return res.status(400).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Verify cohort exists
    const cohort = await db.Cohort.findByPk(cohortId);
    if (!cohort) {
      return res.status(400).json({
        success: false,
        message: 'Cohort not found'
      });
    }

    const student = await db.Student.create({
      email,
      name,
      classId,
      cohortId,
      studentNumber
    });

    // Fetch the created student with associations
    const createdStudent = await db.Student.findByPk(student.id, {
      include: [
        { model: db.Class, as: 'class' },
        { model: db.Cohort, as: 'cohort' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: createdStudent
    });
  } catch (error) {
    console.error('Create student error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, classId, cohortId, studentNumber, status } = req.body;

    const student = await db.Student.findByPk(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if email is being changed and if it conflicts with existing student
    if (email && email !== student.email) {
      const existingStudent = await db.Student.findOne({ where: { email } });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student with this email already exists'
        });
      }
    }

    // Check if student number is being changed and if it conflicts
    if (studentNumber && studentNumber !== student.studentNumber) {
      const existingStudentNumber = await db.Student.findOne({ where: { studentNumber } });
      if (existingStudentNumber) {
        return res.status(400).json({
          success: false,
          message: 'Student with this student number already exists'
        });
      }
    }

    // Verify class exists if being updated
    if (classId) {
      const classItem = await db.Class.findByPk(classId);
      if (!classItem) {
        return res.status(400).json({
          success: false,
          message: 'Class not found'
        });
      }
    }

    // Verify cohort exists if being updated
    if (cohortId) {
      const cohort = await db.Cohort.findByPk(cohortId);
      if (!cohort) {
        return res.status(400).json({
          success: false,
          message: 'Cohort not found'
        });
      }
    }

    await student.update({
      email: email || student.email,
      name: name || student.name,
      classId: classId || student.classId,
      cohortId: cohortId || student.cohortId,
      studentNumber: studentNumber || student.studentNumber,
      status: status || student.status
    });

    // Fetch the updated student with associations
    const updatedStudent = await db.Student.findByPk(id, {
      include: [
        { model: db.Class, as: 'class' },
        { model: db.Cohort, as: 'cohort' }
      ]
    });

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await db.Student.findByPk(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await student.destroy();

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get students by class
const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const students = await db.Student.findAll({
      where: { classId },
      include: [
        { model: db.Class, as: 'class' },
        { model: db.Cohort, as: 'cohort' }
      ],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Get students by class error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get students by cohort
const getStudentsByCohort = async (req, res) => {
  try {
    const { cohortId } = req.params;

    const students = await db.Student.findAll({
      where: { cohortId },
      include: [
        { model: db.Class, as: 'class' },
        { model: db.Cohort, as: 'cohort' }
      ],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Get students by cohort error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByClass,
  getStudentsByCohort
}; 