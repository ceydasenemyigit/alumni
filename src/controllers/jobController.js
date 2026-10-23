const jobPostingModel = require('../models/jobPostingModel');
const userModel = require('../models/userModel');

/**
 * JobController - Web/MVC Controller for Job Postings (Server-Rendered Views)
 */

// 1. GET /jobs - Listing view
exports.index = async (req, res) => {
  try {
    const rawJobs = await jobPostingModel.findAll(req.query);
    const applicationModel = require('../models/applicationModel');

    // Enrich each job with the count of applications submitted
    const jobs = await Promise.all(
      rawJobs.map(async job => {
        const apps = await applicationModel.findByJobId(job.id);
        return {
          ...job,
          applicationCount: apps.length
        };
      })
    );

    // Calculate high-level statistics for the UI header cards
    const allJobs = await jobPostingModel.findAll().catch(() => []);
    const allApps = await applicationModel.findAll().catch(() => []);
    const stats = {
      totalJobs: allJobs.length,
      activeJobs: allJobs.filter(j => j.is_active).length,
      totalApplications: allApps.length
    };

    res.render('jobs/index', {
      title: 'Job Board & Career Opportunities',
      jobs,
      stats,
      query: req.query
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Error',
      statusCode: 500,
      message: 'İş ilanları listelenirken bir hata oluştu: ' + error.message
    });
  }
};

// 2. GET /jobs/new - Form to create a new job posting
exports.newForm = async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.render('jobs/new', {
      title: 'Post a New Job Opportunity',
      users,
      error: null,
      formData: {}
    });
  } catch (error) {
    res.render('jobs/new', {
      title: 'Post a New Job Opportunity',
      users: [],
      error: null,
      formData: {}
    });
  }
};

// 3. POST /jobs - Create job posting from form
exports.create = async (req, res) => {
  try {
    await jobPostingModel.create(req.body);
    res.redirect('/jobs');
  } catch (error) {
    const users = await userModel.findAll().catch(() => []);
    res.status(400).render('jobs/new', {
      title: 'Post a New Job Opportunity',
      users,
      error: error.message,
      formData: req.body
    });
  }
};

// 4. GET /jobs/:id - Details view
exports.show = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).render('error', {
      title: 'Geçersiz ID',
      statusCode: 400,
      message: 'Geçersiz iş ilanı ID formatı.'
    });
  }

  try {
    const job = await jobPostingModel.findById(id);
    if (!job) {
      return res.status(404).render('error', {
        title: 'İlan Bulunamadı',
        statusCode: 404,
        message: `ID ${id} olan iş ilanı bulunamadı.`
      });
    }

    const applicationModel = require('../models/applicationModel');
    const [poster, rawApplications] = await Promise.all([
      jobPostingModel.getPoster(id),
      jobPostingModel.getApplications(id)
    ]);

    // Populate each candidate application with user details
    const applications = await Promise.all(
      rawApplications.map(app => applicationModel.findWithRelations(app.id))
    );

    res.render('jobs/show', {
      title: job.title + ' - ' + job.company,
      job,
      poster,
      applications
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Hata',
      statusCode: 500,
      message: error.message
    });
  }
};

// 5. GET /jobs/:id/edit - Edit form view
exports.editForm = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).render('error', {
      title: 'Geçersiz ID',
      statusCode: 400,
      message: 'Geçersiz iş ilanı ID formatı.'
    });
  }

  try {
    const job = await jobPostingModel.findById(id);
    if (!job) {
      return res.status(404).render('error', {
        title: 'İlan Bulunamadı',
        statusCode: 404,
        message: `ID ${id} olan iş ilanı bulunamadı.`
      });
    }

    const users = await userModel.findAll().catch(() => []);

    res.render('jobs/edit', {
      title: 'Edit: ' + job.title,
      job,
      users,
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

// 6. PUT or POST /jobs/:id - Update job posting
exports.update = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).render('error', {
      title: 'Geçersiz ID',
      statusCode: 400,
      message: 'Geçersiz iş ilanı ID formatı.'
    });
  }

  try {
    await jobPostingModel.update(id, req.body);
    res.redirect(`/jobs/${id}`);
  } catch (error) {
    const job = await jobPostingModel.findById(id).catch(() => null);
    const users = await userModel.findAll().catch(() => []);
    res.status(400).render('jobs/edit', {
      title: 'Edit Job',
      job: job || { id, ...req.body },
      users,
      error: error.message
    });
  }
};

// 7. DELETE or POST /jobs/:id/delete - Delete job posting
exports.delete = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).render('error', {
      title: 'Geçersiz ID',
      statusCode: 400,
      message: 'Geçersiz iş ilanı ID formatı.'
    });
  }

  try {
    await jobPostingModel.delete(id);
    res.redirect('/jobs');
  } catch (error) {
    res.status(error.status || 500).render('error', {
      title: 'Hata',
      statusCode: error.status || 500,
      message: error.message
    });
  }
};
