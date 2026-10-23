const applicationModel = require('../models/applicationModel');
const userModel = require('../models/userModel');
const jobPostingModel = require('../models/jobPostingModel');

/**
 * ApplicationController - Web/MVC Controller for Applications (Server-Rendered Views)
 */

// 1. GET /applications - Listing view
exports.index = async (req, res) => {
  try {
    const [rawApps, allJobs, allRawApps] = await Promise.all([
      applicationModel.findAll(req.query),
      jobPostingModel.findAll().catch(() => []),
      applicationModel.findAll().catch(() => [])
    ]);

    const applications = await Promise.all(
      rawApps.map(app => applicationModel.findWithRelations(app.id))
    );

    const stats = {
      total: allRawApps.length,
      pending: allRawApps.filter(a => a.status === 'PENDING').length,
      reviewing: allRawApps.filter(a => a.status === 'REVIEWING').length,
      accepted: allRawApps.filter(a => a.status === 'ACCEPTED').length,
      rejected: allRawApps.filter(a => a.status === 'REJECTED').length
    };

    res.render('applications/index', {
      title: 'Job Applications & Candidacies',
      applications,
      jobs: allJobs,
      stats,
      query: req.query
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Error',
      statusCode: 500,
      message: 'Başvurular listelenirken bir hata oluştu: ' + error.message
    });
  }
};

// 2. GET /applications/new - Form to apply for a job
exports.newForm = async (req, res) => {
  try {
    const [users, jobs] = await Promise.all([
      userModel.findAll().catch(() => []),
      jobPostingModel.findAll({ is_active: true }).catch(() => [])
    ]);

    const preselectedJobId = req.query.job_id ? parseInt(req.query.job_id, 10) : null;
    const preselectedUserId = req.query.user_id ? parseInt(req.query.user_id, 10) : null;

    res.render('applications/new', {
      title: 'Submit a Job Application',
      users,
      jobs,
      preselectedJobId,
      preselectedUserId,
      error: null,
      formData: {
        job_posting_id: preselectedJobId || '',
        user_id: preselectedUserId || ''
      }
    });
  } catch (error) {
    res.render('applications/new', {
      title: 'Submit a Job Application',
      users: [],
      jobs: [],
      preselectedJobId: null,
      preselectedUserId: null,
      error: error.message,
      formData: {}
    });
  }
};

// 3. POST /applications - Create application from form
exports.create = async (req, res) => {
  try {
    await applicationModel.create(req.body);
    res.redirect('/applications');
  } catch (error) {
    const [users, jobs] = await Promise.all([
      userModel.findAll().catch(() => []),
      jobPostingModel.findAll({ is_active: true }).catch(() => [])
    ]);

    res.status(400).render('applications/new', {
      title: 'Submit a Job Application',
      users,
      jobs,
      preselectedJobId: req.body.job_posting_id ? parseInt(req.body.job_posting_id, 10) : null,
      preselectedUserId: req.body.user_id ? parseInt(req.body.user_id, 10) : null,
      error: error.message,
      formData: req.body
    });
  }
};

// 4. GET /applications/:id - Details view
exports.show = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).render('error', {
      title: 'Geçersiz ID',
      statusCode: 400,
      message: 'Geçersiz başvuru ID formatı.'
    });
  }

  try {
    const application = await applicationModel.findWithRelations(id);
    if (!application) {
      return res.status(404).render('error', {
        title: 'Başvuru Bulunamadı',
        statusCode: 404,
        message: `ID ${id} olan başvuru bulunamadı.`
      });
    }

    res.render('applications/show', {
      title: `Application #${application.id} - ${application.job_posting ? application.job_posting.title : 'Job'}`,
      application
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Hata',
      statusCode: 500,
      message: error.message
    });
  }
};

// 5. GET /applications/:id/edit - Edit status and details view
exports.editForm = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).render('error', {
      title: 'Geçersiz ID',
      statusCode: 400,
      message: 'Geçersiz başvuru ID formatı.'
    });
  }

  try {
    const application = await applicationModel.findWithRelations(id);
    if (!application) {
      return res.status(404).render('error', {
        title: 'Başvuru Bulunamadı',
        statusCode: 404,
        message: `ID ${id} olan başvuru bulunamadı.`
      });
    }

    res.render('applications/edit', {
      title: `Edit Application #${application.id}`,
      application,
      validStatuses: ['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      error: null
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Hata',
      statusCode: 500,
      message: error.message
    });
  }
};

// 6. PUT or POST /applications/:id - Update application
exports.update = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).render('error', {
      title: 'Geçersiz ID',
      statusCode: 400,
      message: 'Geçersiz başvuru ID formatı.'
    });
  }

  try {
    await applicationModel.update(id, req.body);
    res.redirect(`/applications/${id}`);
  } catch (error) {
    const application = await applicationModel.findWithRelations(id).catch(() => null);
    res.status(400).render('applications/edit', {
      title: `Edit Application #${id}`,
      application: application || { id, ...req.body },
      validStatuses: ['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      error: error.message
    });
  }
};

// 7. DELETE or POST /applications/:id/delete - Delete/withdraw application
exports.delete = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).render('error', {
      title: 'Geçersiz ID',
      statusCode: 400,
      message: 'Geçersiz başvuru ID formatı.'
    });
  }

  try {
    await applicationModel.delete(id);
    res.redirect('/applications');
  } catch (error) {
    res.status(error.status || 500).render('error', {
      title: 'Hata',
      statusCode: error.status || 500,
      message: error.message
    });
  }
};

// 8. POST /applications/:id/status - Quick status transition action
exports.updateStatus = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || !req.body.status) {
    return res.redirect('/applications');
  }

  try {
    await applicationModel.update(id, { status: req.body.status });
    res.redirect(`/applications/${id}`);
  } catch (error) {
    res.redirect(`/applications/${id}`);
  }
};
