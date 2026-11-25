const userModel = require('../models/userModel');
const jobPostingModel = require('../models/jobPostingModel');
const applicationModel = require('../models/applicationModel');
const announcementModel = require('../models/announcementModel');
const { generateToken } = require('../middlewares/authMiddleware');

/**
 * AdminController
 * High-privilege administrative orchestrator for data manipulation,
 * role governance, and KPI monitoring across the entire Alumni platform.
 */

// --- 1. Admin Role Assignment & Claim ---

// GET /admin/claim - Show quick admin elevation / claim interface
exports.getClaim = (req, res) => {
  res.render('admin/claim', {
    title: 'Claim Administrator Privileges',
    currentUser: req.user || null,
    message: null,
    error: null
  });
};

// POST /admin/claim - Elevate current session to ADMIN or establish Antigravity Admin
exports.postClaim = async (req, res) => {
  try {
    let adminIdentity;

    if (req.user && req.user.id) {
      // Elevate currently authenticated user
      if (req.user.id !== 99) {
        await userModel.patch(req.user.id, { role: 'ADMIN' });
      }
      adminIdentity = await userModel.findById(req.user.id);
      if (!adminIdentity) {
        adminIdentity = { ...req.user, role: 'ADMIN' };
      }
    } else {
      // Sign in as pre-configured Antigravity Admin
      adminIdentity = userModel.adminUser;
    }

    const token = generateToken(adminIdentity);
    if (res.setAuthCookie) {
      res.setAuthCookie(token);
    }

    req.user = adminIdentity;
    res.locals.currentUser = adminIdentity;

    res.redirect('/admin?claimed=true');
  } catch (err) {
    res.status(500).render('admin/claim', {
      title: 'Claim Administrator Privileges',
      currentUser: req.user || null,
      message: null,
      error: 'Admin elevation failed: ' + err.message
    });
  }
};

// POST /api/admin/claim - API endpoint to claim/assign admin role and receive Bearer token
exports.apiClaim = async (req, res) => {
  try {
    let adminIdentity;
    let message;

    if (req.user && req.user.id) {
      if (req.user.id !== 99) {
        await userModel.patch(req.user.id, { role: 'ADMIN' });
      }
      adminIdentity = await userModel.findById(req.user.id);
      if (!adminIdentity) {
        adminIdentity = { ...req.user, role: 'ADMIN' };
      }
      message = `User ID ${adminIdentity.id} (${adminIdentity.email}) elevated to ADMIN role successfully.`;
    } else {
      adminIdentity = userModel.adminUser;
      message = 'Antigravity Superuser Admin session established successfully.';
    }

    const token = generateToken(adminIdentity);
    if (res.setAuthCookie) {
      res.setAuthCookie(token);
    }

    res.status(200).json({
      success: true,
      message,
      token,
      user: {
        id: adminIdentity.id,
        email: adminIdentity.email,
        first_name: adminIdentity.first_name,
        last_name: adminIdentity.last_name,
        role: 'ADMIN',
        department: adminIdentity.department || adminIdentity.department_name
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Admin Claim Error',
      message: err.message
    });
  }
};

// --- 2. Admin Dashboard & Metrics ---

// GET /admin - Executive Control Center
exports.getDashboard = async (req, res) => {
  try {
    const [users, jobs, applications, announcements] = await Promise.all([
      userModel.findAllAdmin ? userModel.findAllAdmin() : userModel.findAll(),
      jobPostingModel.findAll(),
      applicationModel.findAll(),
      announcementModel.findAll()
    ]);

    const stats = {
      totalUsers: users.length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      alumni: users.filter(u => u.role === 'ALUMNI').length,
      students: users.filter(u => u.role === 'STUDENT').length,
      verifiedUsers: users.filter(u => u.is_verified).length,
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.is_active).length,
      inactiveJobs: jobs.filter(j => !j.is_active).length,
      totalApplications: applications.length,
      pendingApps: applications.filter(a => a.status === 'PENDING').length,
      reviewingApps: applications.filter(a => a.status === 'REVIEWING').length,
      acceptedApps: applications.filter(a => a.status === 'ACCEPTED').length,
      rejectedApps: applications.filter(a => a.status === 'REJECTED').length,
      totalAnnouncements: announcements.length
    };

    res.render('admin/index', {
      title: 'Executive Admin Dashboard',
      stats,
      users: users.slice(0, 8),
      jobs: jobs.slice(0, 6),
      applications: applications.slice(0, 6),
      announcements: announcements.slice(0, 5),
      claimed: req.query.claimed === 'true',
      successMessage: req.query.msg || null
    });
  } catch (err) {
    res.status(500).render('error', {
      title: 'Admin Dashboard Error',
      message: 'Failed to aggregate administrative telemetry: ' + err.message
    });
  }
};

// GET /api/admin/stats - API Metrics telemetry
exports.apiGetStats = async (req, res) => {
  try {
    const [users, jobs, applications, announcements] = await Promise.all([
      userModel.findAllAdmin ? userModel.findAllAdmin() : userModel.findAll(),
      jobPostingModel.findAll(),
      applicationModel.findAll(),
      announcementModel.findAll()
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: users.length,
          admin: users.filter(u => u.role === 'ADMIN').length,
          alumni: users.filter(u => u.role === 'ALUMNI').length,
          student: users.filter(u => u.role === 'STUDENT').length,
          verified: users.filter(u => u.is_verified).length
        },
        jobs: {
          total: jobs.length,
          active: jobs.filter(j => j.is_active).length,
          inactive: jobs.filter(j => !j.is_active).length
        },
        applications: {
          total: applications.length,
          pending: applications.filter(a => a.status === 'PENDING').length,
          reviewing: applications.filter(a => a.status === 'REVIEWING').length,
          accepted: applications.filter(a => a.status === 'ACCEPTED').length,
          rejected: applications.filter(a => a.status === 'REJECTED').length,
          withdrawn: applications.filter(a => a.status === 'WITHDRAWN').length
        },
        announcements: {
          total: announcements.length
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- 3. User Governance & Manipulation ---

// GET /admin/users - Comprehensive User Management Table
exports.getUsers = async (req, res) => {
  try {
    const users = userModel.findAllAdmin ? await userModel.findAllAdmin() : await userModel.findAll();
    res.render('admin/users', {
      title: 'User Management & Role Governance',
      users,
      roleFilter: req.query.role || '',
      successMessage: req.query.msg || null
    });
  } catch (err) {
    res.status(500).render('error', { title: 'User Management Error', message: err.message });
  }
};

// GET /api/admin/users
exports.apiGetUsers = async (req, res) => {
  try {
    const users = userModel.findAllAdmin ? await userModel.findAllAdmin() : await userModel.findAll();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /admin/users/:id/role - Change User Role
exports.postUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const cleanRole = String(role).toUpperCase();

    if (!['STUDENT', 'ALUMNI', 'ADMIN'].includes(cleanRole)) {
      return res.redirect('/admin/users?error=Invalid+Role');
    }

    await userModel.patch(id, { role: cleanRole });
    res.redirect(`/admin/users?msg=User+ID+${id}+role+updated+to+${cleanRole}`);
  } catch (err) {
    res.status(500).render('error', { title: 'Update Role Error', message: err.message });
  }
};

// PATCH /api/admin/users/:id/role
exports.apiUpdateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = (req.body.role || '').toUpperCase();

    if (!['STUDENT', 'ALUMNI', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Role must be one of: STUDENT, ALUMNI, ADMIN'
      });
    }

    const updated = await userModel.patch(id, { role });
    res.status(200).json({
      success: true,
      message: `User #${id} role successfully updated to ${role}`,
      data: updated
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
};

// POST /admin/users/:id/toggle-verify - Toggle is_verified
exports.postToggleUserVerify = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).render('error', { title: 'Not Found', message: `User #${id} not found.` });
    }

    const newStatus = !user.is_verified;
    await userModel.patch(id, { is_verified: newStatus });
    res.redirect(`/admin/users?msg=User+ID+${id}+verification+set+to+${newStatus}`);
  } catch (err) {
    res.status(500).render('error', { title: 'Verification Toggle Error', message: err.message });
  }
};

// PATCH /api/admin/users/:id/verify
exports.apiToggleUserVerify = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: `User #${id} not found` });
    }

    const isVerified = req.body.is_verified !== undefined ? Boolean(req.body.is_verified) : !user.is_verified;
    const updated = await userModel.patch(id, { is_verified: isVerified });

    res.status(200).json({
      success: true,
      message: `User #${id} verification updated to ${isVerified}`,
      data: updated
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
};

// POST /admin/users/:id/delete - Delete user from web form
exports.postDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id, 10) === 99) {
      return res.redirect('/admin/users?error=Cannot+delete+root+admin');
    }
    await userModel.delete(id);
    res.redirect(`/admin/users?msg=User+ID+${id}+deleted+successfully`);
  } catch (err) {
    res.status(500).render('error', { title: 'Delete User Error', message: err.message });
  }
};

// DELETE /api/admin/users/:id
exports.apiDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id, 10) === 99) {
      return res.status(403).json({ success: false, error: 'Forbidden', message: 'Root Antigravity admin cannot be deleted.' });
    }
    const deleted = await userModel.delete(id);
    res.status(200).json({
      success: true,
      message: `User #${id} removed from system.`,
      data: deleted
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
};

// --- 4. Job Postings Manipulation ---

// GET /admin/jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await jobPostingModel.findAll();
    res.render('admin/jobs', {
      title: 'Job Postings Administration',
      jobs,
      successMessage: req.query.msg || null
    });
  } catch (err) {
    res.status(500).render('error', { title: 'Job Admin Error', message: err.message });
  }
};

// GET /api/admin/jobs
exports.apiGetJobs = async (req, res) => {
  try {
    const jobs = await jobPostingModel.findAll();
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /admin/jobs/:id/toggle-status
exports.postToggleJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await jobPostingModel.findById(id);
    if (!job) {
      return res.status(404).render('error', { title: 'Not Found', message: `Job #${id} not found.` });
    }

    const newStatus = !job.is_active;
    await jobPostingModel.update(id, { is_active: newStatus });
    res.redirect(`/admin/jobs?msg=Job+ID+${id}+status+set+to+${newStatus ? 'Active' : 'Inactive'}`);
  } catch (err) {
    res.status(500).render('error', { title: 'Job Status Toggle Error', message: err.message });
  }
};

// PATCH /api/admin/jobs/:id/status
exports.apiToggleJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await jobPostingModel.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, error: `Job #${id} not found` });
    }

    const newStatus = req.body.is_active !== undefined ? Boolean(req.body.is_active) : !job.is_active;
    const updated = await jobPostingModel.update(id, { is_active: newStatus });

    res.status(200).json({
      success: true,
      message: `Job #${id} active status updated to ${newStatus}`,
      data: updated
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
};

// POST /admin/jobs/:id/delete
exports.postDeleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    await jobPostingModel.delete(id);
    res.redirect(`/admin/jobs?msg=Job+ID+${id}+deleted+successfully`);
  } catch (err) {
    res.status(500).render('error', { title: 'Delete Job Error', message: err.message });
  }
};

// DELETE /api/admin/jobs/:id
exports.apiDeleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await jobPostingModel.delete(id);
    res.status(200).json({
      success: true,
      message: `Job posting #${id} deleted successfully.`,
      data: deleted
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
};

// --- 5. Application Pipeline Manipulation ---

// GET /admin/applications
exports.getApplications = async (req, res) => {
  try {
    const apps = await applicationModel.findAll();
    // Populate with user & job titles for high-context admin visibility
    const populated = await Promise.all(apps.map(async (a) => {
      const applicant = await userModel.findById(a.user_id);
      const job = await jobPostingModel.findById(a.job_posting_id);
      return {
        ...a,
        applicant_name: applicant ? `${applicant.first_name} ${applicant.last_name}` : `User #${a.user_id}`,
        applicant_email: applicant ? applicant.email : '',
        job_title: job ? job.title : `Job #${a.job_posting_id}`,
        company: job ? job.company : ''
      };
    }));

    res.render('admin/applications', {
      title: 'Candidate Application Pipeline Management',
      applications: populated,
      successMessage: req.query.msg || null
    });
  } catch (err) {
    res.status(500).render('error', { title: 'Application Admin Error', message: err.message });
  }
};

// GET /api/admin/applications
exports.apiGetApplications = async (req, res) => {
  try {
    const apps = await applicationModel.findAll();
    res.status(200).json({ success: true, count: apps.length, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /admin/applications/:id/status
exports.postUpdateAppStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const cleanStatus = String(status).toUpperCase();

    if (!['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'].includes(cleanStatus)) {
      return res.redirect('/admin/applications?error=Invalid+Status');
    }

    await applicationModel.updateStatus(id, cleanStatus);
    res.redirect(`/admin/applications?msg=Application+ID+${id}+status+updated+to+${cleanStatus}`);
  } catch (err) {
    res.status(500).render('error', { title: 'Update Application Status Error', message: err.message });
  }
};

// PATCH /api/admin/applications/:id/status
exports.apiUpdateAppStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = (req.body.status || '').toUpperCase();

    if (!['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Status must be one of: PENDING, REVIEWING, ACCEPTED, REJECTED, WITHDRAWN'
      });
    }

    const updated = await applicationModel.updateStatus(id, status);
    res.status(200).json({
      success: true,
      message: `Application #${id} status changed to ${status}`,
      data: updated
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
};

// POST /admin/applications/:id/delete
exports.postDeleteApp = async (req, res) => {
  try {
    const { id } = req.params;
    await applicationModel.delete(id);
    res.redirect(`/admin/applications?msg=Application+ID+${id}+deleted+successfully`);
  } catch (err) {
    res.status(500).render('error', { title: 'Delete Application Error', message: err.message });
  }
};

// DELETE /api/admin/applications/:id
exports.apiDeleteApp = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await applicationModel.delete(id);
    res.status(200).json({
      success: true,
      message: `Application #${id} deleted successfully.`,
      data: deleted
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
};

// --- 6. Announcements Management ---

// GET /admin/announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await announcementModel.findAll();
    res.render('admin/announcements', {
      title: 'Announcements Administration',
      announcements,
      successMessage: req.query.msg || null
    });
  } catch (err) {
    res.status(500).render('error', { title: 'Announcements Admin Error', message: err.message });
  }
};

// POST /admin/announcements
exports.postCreateAnnouncement = async (req, res) => {
  try {
    const { title, content, category, author } = req.body;
    await announcementModel.create({
      title,
      content,
      category: category || 'General',
      author: author || 'Platform Admin'
    });
    res.redirect('/admin/announcements?msg=Announcement+broadcasted+successfully');
  } catch (err) {
    res.status(500).render('error', { title: 'Create Announcement Error', message: err.message });
  }
};

// POST /admin/announcements/:id/delete
exports.postDeleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await announcementModel.delete(id);
    res.redirect('/admin/announcements?msg=Announcement+deleted+successfully');
  } catch (err) {
    res.status(500).render('error', { title: 'Delete Announcement Error', message: err.message });
  }
};
