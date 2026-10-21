const jobPostingModel = require('../models/jobPostingModel');

/**
 * ApiJobController - Handles RESTful JSON API operations for Job Postings
 */

// GET /api/jobs - List job postings
exports.getAll = async (req, res) => {
  try {
    const jobs = await jobPostingModel.findAll(req.query);
    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// GET /api/jobs/:id - Get single job posting
exports.getById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz iş ilanı ID formatı.'
    });
  }

  try {
    const job = await jobPostingModel.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `ID ${id} olan iş ilanı bulunamadı.`
      });
    }

    return res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// GET /api/jobs/:id/poster - Get the user who posted the job
exports.getPoster = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz iş ilanı ID formatı.'
    });
  }

  try {
    const poster = await jobPostingModel.getPoster(id);
    if (!poster) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `ID ${id} olan ilanın yayıncısı bulunamadı.`
      });
    }

    return res.status(200).json({
      success: true,
      data: poster
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// POST /api/jobs - Create a new job posting
exports.create = async (req, res) => {
  try {
    const payload = { ...req.query, ...req.body };
    const newJob = await jobPostingModel.create(payload);

    return res.status(201).json({
      success: true,
      message: 'İş ilanı başarıyla oluşturuldu.',
      data: newJob
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: 'Bad Request',
      message: error.message
    });
  }
};

// PUT /api/jobs/:id - Full update
exports.update = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz iş ilanı ID formatı.'
    });
  }

  try {
    const payload = { ...req.query, ...req.body };
    const updated = await jobPostingModel.update(id, payload);

    return res.status(200).json({
      success: true,
      message: `ID ${id} olan iş ilanı güncellendi.`,
      data: updated
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.status === 404 ? 'Not Found' : 'Bad Request',
      message: error.message
    });
  }
};

// PATCH /api/jobs/:id - Partial update
exports.patch = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz iş ilanı ID formatı.'
    });
  }

  try {
    const payload = { ...req.query, ...req.body };
    const updated = await jobPostingModel.update(id, payload);

    return res.status(200).json({
      success: true,
      message: `ID ${id} olan iş ilanı kısmi güncellendi (PATCH).`,
      data: updated
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.status === 404 ? 'Not Found' : 'Bad Request',
      message: error.message
    });
  }
};

// DELETE /api/jobs/:id - Remove job posting
exports.remove = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz iş ilanı ID formatı.'
    });
  }

  try {
    const deleted = await jobPostingModel.delete(id);
    return res.status(200).json({
      success: true,
      message: `ID ${id} olan iş ilanı silindi.`,
      data: deleted
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.status === 404 ? 'Not Found' : 'Bad Request',
      message: error.message
    });
  }
};
