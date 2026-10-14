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
