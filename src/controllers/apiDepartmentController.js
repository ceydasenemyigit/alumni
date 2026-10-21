const departmentModel = require('../models/departmentModel');

/**
 * ApiDepartmentController - RESTful JSON API operations for Academic Departments
 */

// GET /api/departments - List all departments
exports.getAll = async (req, res) => {
  try {
    const departments = await departmentModel.findAll();
    return res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// GET /api/departments/:id - Get department by ID
exports.getById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz bölüm ID formatı.'
    });
  }

  try {
    const department = await departmentModel.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `ID ${id} olan bölüm bulunamadı.`
      });
    }

    return res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// GET /api/departments/:id/users - Get all users in this department (Relational)
exports.getUsers = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz bölüm ID formatı.'
    });
  }

  try {
    const department = await departmentModel.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `ID ${id} olan bölüm bulunamadı.`
      });
    }

    const users = await departmentModel.getUsers(id);
    return res.status(200).json({
      success: true,
      department: department.name,
      count: users.length,
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// POST /api/departments - Create department
exports.create = async (req, res) => {
  try {
    const payload = { ...req.query, ...req.body };
    const newDept = await departmentModel.create(payload);
    return res.status(201).json({
      success: true,
      message: 'Bölüm başarıyla oluşturuldu.',
      data: newDept
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: 'Bad Request',
      message: error.message
    });
  }
};
