const userModel = require('../models/userModel');

/**
 * ApiUserController - Handles RESTful JSON API operations for Users
 */

// GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const users = await userModel.findAll(req.query);
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.type || 'Internal Server Error',
      message: error.message
    });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz kullanıcı ID formatı.'
    });
  }

  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `ID ${id} olan kullanıcı bulunamadı.`
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.type || 'Internal Server Error',
      message: error.message
    });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const payload = { ...req.query, ...req.body };
    const user = await userModel.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu.',
      data: user
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.type || 'Internal Server Error',
      message: error.message
    });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Geçersiz kullanıcı ID formatı.'
      });
    }

    const payload = { ...req.query, ...req.body };
    const updated = await userModel.update(id, payload);

    return res.status(200).json({
      success: true,
      message: `ID ${id} olan kullanıcı başarıyla güncellendi (PUT).`,
      data: updated
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.type || 'Internal Server Error',
      message: error.message
    });
  }
};

// PATCH /api/users/:id
exports.patchUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Geçersiz kullanıcı ID formatı.'
      });
    }

    const payload = { ...req.query, ...req.body };
    const patched = await userModel.patch(id, payload);

    return res.status(200).json({
      success: true,
      message: `ID ${id} olan kullanıcı başarıyla kısmi güncellendi (PATCH).`,
      data: patched
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.type || 'Internal Server Error',
      message: error.message
    });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Geçersiz kullanıcı ID formatı.'
      });
    }

    const deleted = await userModel.delete(id);
    return res.status(200).json({
      success: true,
      message: `ID ${id} olan kullanıcı başarıyla silindi.`,
      data: deleted
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.type || 'Internal Server Error',
      message: error.message
    });
  }
};

// GET /api/users/:id/profile - Get alumni career profile (1:1 Relation)
exports.getUserProfile = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz kullanıcı ID formatı.'
    });
  }

  try {
    const profile = await userModel.getProfile(id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `ID ${id} olan kullanıcının profili bulunamadı.`
      });
    }

    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// GET /api/users/:id/department - Get user department (N:1 Relation)
exports.getUserDepartment = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz kullanıcı ID formatı.'
    });
  }

  try {
    const dept = await userModel.getDepartment(id);
    if (!dept) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `ID ${id} olan kullanıcının bölümü bulunamadı.`
      });
    }

    return res.status(200).json({
      success: true,
      data: dept
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// GET /api/users/:id/jobs - Get jobs posted by user (1:N Relation)
exports.getUserJobs = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz kullanıcı ID formatı.'
    });
  }

  try {
    const jobs = await userModel.getJobPostings(id);
    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// GET /api/users/:id/relations - Get fully populated user with all relations
exports.getUserRelations = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz kullanıcı ID formatı.'
    });
  }

  try {
    const userWithRelations = await userModel.findWithRelations(id);
    if (!userWithRelations) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `ID ${id} olan kullanıcı bulunamadı.`
      });
    }

    return res.status(200).json({
      success: true,
      data: userWithRelations
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

