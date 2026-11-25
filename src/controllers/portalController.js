const userModel = require('../models/userModel');
const jobPostingModel = require('../models/jobPostingModel');
const applicationModel = require('../models/applicationModel');
const alumniProfileModel = require('../models/alumniProfileModel');
const departmentModel = require('../models/departmentModel');

/**
 * PortalController
 * Dedicated orchestrator for role-specific user workspaces:
 * - Student Portal (Application tracking, department career vacancies, academic progress)
 * - Alumni Workspace (Posted job vacancies, candidate pipeline management, professional profile)
 * - Universal Dashboard Dispatcher & Profile Settings
 */

// GET /dashboard - Smart role-aware dispatcher
exports.getDashboard = (req, res) => {
  if (!req.user) {
    return res.redirect('/login?redirect=/dashboard');
  }

  const role = (req.user.role || '').toUpperCase();
  if (role === 'ADMIN') {
    return res.redirect('/admin');
  }
  if (role === 'ALUMNI') {
    return res.redirect('/alumni');
  }
  return res.redirect('/student');
};

// GET /student - Dedicated Student Workspace
exports.getStudentPortal = async (req, res) => {
  try {
    const userId = req.user.id;
    let student = await userModel.findById(userId);
    if (!student) {
      student = req.user;
    }

    // Fetch student's submitted applications populated with target job postings
    const rawApps = await applicationModel.findByUserId(userId);
    const populatedApps = await Promise.all(
      rawApps.map(async (app) => {
        const job = await jobPostingModel.findById(app.job_posting_id);
        return {
          ...app,
          job_title: job ? job.title : `Vacancy #${app.job_posting_id}`,
          company: job ? job.company : 'Company Not Listed',
          location: job ? job.location : 'Remote',
          employment_type: job ? job.employment_type : 'Full-Time',
          deadline: job ? job.deadline : null
        };
      })
    );

    // Fetch recommended jobs (internships, remote, or matching department)
    const allJobs = await jobPostingModel.findAll({ is_active: true });
    const appliedJobIds = new Set(rawApps.map(a => a.job_posting_id));
    const recommendedJobs = allJobs
      .filter(j => !appliedJobIds.has(j.id))
      .slice(0, 6);

    // Telemetry stats for student dashboard
    const stats = {
      totalApplications: populatedApps.length,
      pending: populatedApps.filter(a => a.status === 'PENDING').length,
      reviewing: populatedApps.filter(a => a.status === 'REVIEWING').length,
      accepted: populatedApps.filter(a => a.status === 'ACCEPTED').length,
      rejected: populatedApps.filter(a => a.status === 'REJECTED').length
    };

    res.render('portal/student', {
      title: 'Student Career Portal & Tracker',
      student,
      stats,
      applications: populatedApps,
      recommendedJobs,
      successMessage: req.query.msg || null,
      errorMessage: req.query.error || null
    });
  } catch (err) {
    res.status(500).render('error', {
      title: 'Student Portal Error',
      message: 'Failed to load student workspace: ' + err.message
    });
  }
};

// GET /alumni - Dedicated Alumni Workspace
exports.getAlumniPortal = async (req, res) => {
  try {
    const userId = req.user.id;
    let alumni = await userModel.findById(userId);
    if (!alumni) {
      alumni = req.user;
    }
    const profile = (await alumniProfileModel.findByUserId(userId)) || {};

    // 1. Fetch job postings created by this alumnus
    const myJobs = await jobPostingModel.findByUserId(userId);

    // 2. Fetch all candidate applications received for this alumnus's job postings
    const myJobIds = new Set(myJobs.map(j => j.id));
    const allApps = await applicationModel.findAll();
    const receivedAppsRaw = allApps.filter(a => myJobIds.has(a.job_posting_id));

    // Populate received candidate applications with applicant details & job title
    const candidateApplications = await Promise.all(
      receivedAppsRaw.map(async (app) => {
        const [candidate, job] = await Promise.all([
          userModel.findById(app.user_id),
          jobPostingModel.findById(app.job_posting_id)
        ]);
        return {
          ...app,
          candidate_name: candidate ? `${candidate.first_name} ${candidate.last_name}` : `Candidate #${app.user_id}`,
          candidate_email: candidate ? candidate.email : '',
          candidate_department: candidate ? (candidate.department || candidate.department_name) : '',
          job_title: job ? job.title : `Vacancy #${app.job_posting_id}`
        };
      })
    );

    // Compute applicant counts per job
    const jobStats = myJobs.map(j => ({
      ...j,
      applicant_count: receivedAppsRaw.filter(a => a.job_posting_id === j.id).length
    }));

    // Overview KPIs
    const stats = {
      totalPostedJobs: myJobs.length,
      activeJobs: myJobs.filter(j => j.is_active).length,
      totalCandidates: candidateApplications.length,
      pendingReview: candidateApplications.filter(a => a.status === 'PENDING' || a.status === 'REVIEWING').length
    };

    res.render('portal/alumni', {
      title: 'Alumni Workspace & Talent Manager',
      alumni,
      profile,
      stats,
      myJobs: jobStats,
      candidateApplications,
      successMessage: req.query.msg || null,
      errorMessage: req.query.error || null
    });
  } catch (err) {
    res.status(500).render('error', {
      title: 'Alumni Workspace Error',
      message: 'Failed to load alumni workspace: ' + err.message
    });
  }
};

// GET /my/applications - Direct My Applications list (Student / Alumnus)
exports.getMyApplications = async (req, res) => {
  try {
    const rawApps = await applicationModel.findByUserId(req.user.id);
    const populatedApps = await Promise.all(
      rawApps.map(async (app) => {
        const job = await jobPostingModel.findById(app.job_posting_id);
        return {
          ...app,
          job_title: job ? job.title : `Vacancy #${app.job_posting_id}`,
          company: job ? job.company : 'Company',
          location: job ? job.location : 'Remote'
        };
      })
    );

    res.render('portal/my-applications', {
      title: 'My Submitted Applications',
      applications: populatedApps,
      successMessage: req.query.msg || null
    });
  } catch (err) {
    res.status(500).render('error', { title: 'Applications Error', message: err.message });
  }
};

// GET /my/jobs - Direct My Posted Jobs manager
exports.getMyJobs = async (req, res) => {
  try {
    const myJobs = await jobPostingModel.findByUserId(req.user.id);
    const populated = await Promise.all(
      myJobs.map(async (j) => {
        const apps = await applicationModel.findByJobId(j.id);
        return {
          ...j,
          applicant_count: apps.length
        };
      })
    );

    res.render('portal/my-jobs', {
      title: 'My Posted Job Opportunities',
      jobs: populated,
      successMessage: req.query.msg || null
    });
  } catch (err) {
    res.status(500).render('error', { title: 'Job Listings Error', message: err.message });
  }
};

// POST /portal/applications/:id/withdraw - Withdraw an application
exports.postWithdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await applicationModel.findById(id);

    if (!app) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Application not found.' });
    }

    // Only owner or admin can withdraw
    if (app.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).render('error', { title: 'Forbidden', message: 'Cannot withdraw applications submitted by other users.' });
    }

    await applicationModel.updateStatus(id, 'WITHDRAWN');
    const returnTarget = req.body.redirect || '/student';
    res.redirect(`${returnTarget}?msg=Application+successfully+withdrawn`);
  } catch (err) {
    res.status(500).render('error', { title: 'Withdrawal Error', message: err.message });
  }
};

// POST /alumni/applications/:id/status - Alumnus updates status of received candidate application
exports.postUpdateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const cleanStatus = String(status).toUpperCase();

    const app = await applicationModel.findById(id);
    if (!app) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Application record not found.' });
    }

    const job = await jobPostingModel.findById(app.job_posting_id);
    // Ensure the current user is the poster of the job or an admin
    if (job && job.posted_by_user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).render('error', { title: 'Forbidden', message: 'You can only review applications for jobs you posted.' });
    }

    await applicationModel.updateStatus(id, cleanStatus);
    res.redirect('/alumni?msg=Candidate+application+status+updated+to+' + cleanStatus);
  } catch (err) {
    res.status(500).render('error', { title: 'Update Candidate Status Error', message: err.message });
  }
};

// GET /profile or /me - Unified Account Settings Page
exports.getProfile = async (req, res) => {
  try {
    let user = await userModel.findById(req.user.id);
    if (!user) {
      user = req.user;
    }
    const profile = (await alumniProfileModel.findByUserId(req.user.id)) || {};
    const departments = await departmentModel.findAll();

    res.render('portal/profile', {
      title: 'Account & Professional Profile Settings',
      user,
      profile,
      departments,
      successMessage: req.query.msg || null,
      errorMessage: req.query.error || null
    });
  } catch (err) {
    res.status(500).render('error', { title: 'Profile Error', message: err.message });
  }
};

// POST /profile - Update User & Alumni Profile
exports.postUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      first_name,
      last_name,
      department,
      graduation_year,
      current_company,
      current_title,
      industry,
      city,
      country,
      linkedin_url,
      github_url,
      bio
    } = req.body;

    // Update core User details
    await userModel.patch(userId, {
      first_name,
      last_name,
      department,
      graduation_year: graduation_year ? parseInt(graduation_year, 10) : null
    });

    // Update or create Alumni Profile details
    await alumniProfileModel.upsert(userId, {
      current_company,
      current_title,
      industry,
      city,
      country: country || 'Turkey',
      linkedin_url,
      github_url,
      bio
    });

    res.redirect('/profile?msg=Profile+updated+successfully');
  } catch (err) {
    res.status(500).render('portal/profile', {
      title: 'Account Settings',
      user: req.user,
      profile: req.body,
      departments: await departmentModel.findAll().catch(() => []),
      successMessage: null,
      errorMessage: 'Update failed: ' + err.message
    });
  }
};

// --- Programmatic RESTful API Endpoints (/api/me) ---

// GET /api/me
exports.apiGetMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const [user, profile, applications, jobs] = await Promise.all([
      userModel.findById(userId),
      alumniProfileModel.findByUserId(userId),
      applicationModel.findByUserId(userId),
      jobPostingModel.findByUserId(userId)
    ]);

    res.status(200).json({
      success: true,
      user: user || req.user,
      data: {
        user: user || req.user,
        profile: profile || null,
        applications,
        jobs
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/me/applications
exports.apiGetMyApplications = async (req, res) => {
  try {
    const apps = await applicationModel.findByUserId(req.user.id);
    res.status(200).json({ success: true, count: apps.length, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/me/jobs
exports.apiGetMyJobs = async (req, res) => {
  try {
    const jobs = await jobPostingModel.findByUserId(req.user.id);
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/me/profile
exports.apiUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedUser = await userModel.patch(userId, req.body);
    let updatedProfile = null;

    if (req.body.current_company || req.body.current_title || req.body.linkedin_url || req.body.bio) {
      updatedProfile = await alumniProfileModel.upsert(userId, req.body);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
        profile: updatedProfile
      }
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
};
