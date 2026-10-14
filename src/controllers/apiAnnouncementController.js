const announcementModel = require('../models/announcementModel');

/**
 * ApiAnnouncementController - Handles RESTful JSON API operations for Announcements
 */

// GET /api/announcements - Retrieve all announcements (supports ?category=&author=&search=)
exports.getAll = async (req, res) => {
  try {
    const announcements = await announcementModel.getAll(req.query);
    return res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.type || 'Internal Server Error',
      message: error.message
    });
  }
};

// GET /api/announcements/:id - Retrieve announcement by ID
exports.getById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz duyuru ID formatı.'
    });
  }

  try {
    const announcement = await announcementModel.getById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `ID ${id} olan duyuru bulunamadı.`
      });
    }

    return res.status(200).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.type || 'Internal Server Error',
      message: error.message
    });
  }
};

// POST /api/announcements - Create a new announcement
exports.create = async (req, res) => {
  try {
    const payload = { ...req.query, ...req.body };
    const newAnnouncement = await announcementModel.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Duyuru başarıyla oluşturuldu.',
      data: newAnnouncement
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.type || 'Internal Server Error',
      message: error.message
    });
  }
};

// PUT /api/announcements/:id - Update an announcement
exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Geçersiz duyuru ID formatı.'
      });
    }

    const payload = { ...req.query, ...req.body };
    const updated = await announcementModel.update(id, payload);

    return res.status(200).json({
      success: true,
      message: `ID ${id} olan duyuru başarıyla güncellendi (PUT).`,
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

// PATCH /api/announcements/:id - Partial update of an announcement
exports.patch = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Geçersiz duyuru ID formatı.'
      });
    }

    const payload = { ...req.query, ...req.body };
    const updated = await announcementModel.update(id, payload);

    return res.status(200).json({
      success: true,
      message: `ID ${id} olan duyuru başarıyla kısmi güncellendi (PATCH).`,
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

// DELETE /api/announcements/:id - Remove an announcement
exports.remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Geçersiz duyuru ID formatı.'
      });
    }

    const deleted = await announcementModel.delete(id);
    return res.status(200).json({
      success: true,
      message: `ID ${id} olan duyuru başarıyla silindi.`,
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
