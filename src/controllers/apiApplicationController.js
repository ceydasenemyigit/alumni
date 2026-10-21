/**
 * ApiApplicationController
 * Handles RESTful JSON API operations for Applications (Action table resolving User <-> JobPosting N:M)
 */

const applicationModel = require('../models/applicationModel');

// 1. GET /api/applications - List all applications with optional filtering
exports.getAll = async (req, res) => {
  try {
    const applications = await applicationModel.findAll(req.query);
    
    // Optional query param: with_relations=true
    if (req.query.with_relations === 'true') {
      const detailed = await Promise.all(
        applications.map(app => applicationModel.findWithRelations(app.id))
      );
      return res.status(200).json({
        success: true,
        count: detailed.length,
        data: detailed
      });
    }

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// 2. GET /api/applications/:id - Get single application
exports.getById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz başvuru ID formatı.'
    });
  }

  try {
    const withRelations = req.query.with_relations === 'true';
    const app = withRelations
      ? await applicationModel.findWithRelations(id)
      : await applicationModel.findById(id);

    if (!app) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `ID ${id} olan başvuru bulunamadı.`
      });
    }

    return res.status(200).json({
      success: true,
      data: app
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// 3. GET /api/applications/:id/relations - Get single application with applicant and job posting
exports.getWithRelations = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz başvuru ID formatı.'
    });
  }

  try {
    const app = await applicationModel.findWithRelations(id);
    if (!app) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `ID ${id} olan başvuru bulunamadı.`
      });
    }

    return res.status(200).json({
      success: true,
      data: app
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// 4. POST /api/applications - Submit an application (create relation between User and Job)
exports.create = async (req, res) => {
  try {
    const payload = { ...req.query, ...req.body };
    const newApp = await applicationModel.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Başvuru başarıyla iletildi.',
      data: newApp
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      success: false,
      error: error.status === 409 ? 'Conflict' : 'Bad Request',
      message: error.message
    });
  }
};

// 5. PUT /api/applications/:id - Full update
exports.update = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz başvuru ID formatı.'
    });
  }

  try {
    const payload = { ...req.query, ...req.body };
    const updated = await applicationModel.update(id, payload);

    return res.status(200).json({
      success: true,
      message: `ID ${id} olan başvuru güncellendi.`,
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

// 6. PATCH /api/applications/:id - Partial update
exports.patch = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz başvuru ID formatı.'
    });
  }

  try {
    const payload = { ...req.query, ...req.body };
    const updated = await applicationModel.update(id, payload);

    return res.status(200).json({
      success: true,
      message: `ID ${id} olan başvuru kısmi güncellendi (PATCH).`,
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

// 7. PATCH /api/applications/:id/status - Update application status only
exports.updateStatus = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz başvuru ID formatı.'
    });
  }

  const { status } = req.body;
  if (!status) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Status alanı gereklidir.'
    });
  }

  try {
    const updated = await applicationModel.update(id, { status });
    return res.status(200).json({
      success: true,
      message: `Başvuru durumu güncellendi: ${updated.status}`,
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

// 8. DELETE /api/applications/:id - Withdraw / delete application
exports.remove = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz başvuru ID formatı.'
    });
  }

  try {
    const deleted = await applicationModel.delete(id);
    return res.status(200).json({
      success: true,
      message: `ID ${id} olan başvuru silindi.`,
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

// 9. GET /api/applications/user/:userId - Direct route to get applications by applicant user
exports.getUserApplications = async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz kullanıcı ID formatı.'
    });
  }

  try {
    const applications = await applicationModel.findByUserId(userId);
    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// 10. GET /api/applications/job/:jobId - Direct route to get applications for a job posting
exports.getJobApplications = async (req, res) => {
  const jobId = parseInt(req.params.jobId, 10);
  if (isNaN(jobId)) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Geçersiz iş ilanı ID formatı.'
    });
  }

  try {
    const applications = await applicationModel.findByJobId(jobId);
    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};
