const announcementModel = require('../models/announcementModel');

/**
 * AnnouncementController - Handles server-side rendered HTML views for Announcements
 */

// GET /announcements - Listing view
exports.index = async (req, res) => {
  try {
    const announcements = await announcementModel.getAll(req.query);
    res.render('announcements/index', {
      title: 'Alumni Announcements & Notices',
      announcements,
      search: req.query.search || '',
      activeCategory: req.query.category || ''
    });
  } catch (err) {
    res.status(500).render('error', {
      title: 'Announcements Error',
      message: err.message
    });
  }
};

// GET /announcements/new - Render announcement creation form
exports.newForm = (req, res) => {
  res.render('announcements/new', {
    title: 'Publish New Announcement',
    error: null,
    formData: {}
  });
};

// POST /announcements - Create new announcement from web form
exports.create = async (req, res) => {
  try {
    const newAnnouncement = await announcementModel.create(req.body);
    res.redirect(`/announcements/${newAnnouncement.id}`);
  } catch (err) {
    res.status(err.status || 400).render('announcements/new', {
      title: 'Publish New Announcement',
      error: err.message,
      formData: req.body
    });
  }
};

// GET /announcements/:id - Render single announcement details view
exports.show = async (req, res) => {
  try {
    const announcement = await announcementModel.getById(req.params.id);
    if (!announcement) {
      return res.status(404).render('error', {
        title: 'Announcement Not Found',
        message: `Announcement with ID #${req.params.id} does not exist.`
      });
    }
    res.render('announcements/show', {
      title: announcement.title,
      announcement
    });
  } catch (err) {
    res.status(500).render('error', {
      title: 'Announcement Error',
      message: err.message
    });
  }
};

// GET /announcements/:id/edit - Render announcement edit form
exports.editForm = async (req, res) => {
  try {
    const announcement = await announcementModel.getById(req.params.id);
    if (!announcement) {
      return res.status(404).render('error', {
        title: 'Announcement Not Found',
        message: `Announcement with ID #${req.params.id} does not exist.`
      });
    }
    res.render('announcements/edit', {
      title: `Edit: ${announcement.title}`,
      announcement,
      error: null
    });
  } catch (err) {
    res.status(500).render('error', {
      title: 'Edit Error',
      message: err.message
    });
  }
};

// POST /announcements/:id (or PUT) - Update announcement from form
exports.update = async (req, res) => {
  try {
    const updated = await announcementModel.update(req.params.id, req.body);
    res.redirect(`/announcements/${updated.id}`);
  } catch (err) {
    const announcement = (await announcementModel.getById(req.params.id)) || { id: req.params.id, ...req.body };
    res.status(err.status || 400).render('announcements/edit', {
      title: 'Edit Announcement',
      announcement,
      error: err.message
    });
  }
};

// POST /announcements/:id/delete (or DELETE) - Remove announcement
exports.delete = async (req, res) => {
  try {
    await announcementModel.delete(req.params.id);
    res.redirect('/announcements');
  } catch (err) {
    res.status(err.status || 404).render('error', {
      title: 'Action Failed',
      message: err.message
    });
  }
};
