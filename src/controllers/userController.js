const userModel = require('../models/userModel');

/**
 * UserController - Handles server-side rendered HTML views for Users
 */

// GET /users - Listing view
exports.index = (req, res) => {
  const users = userModel.findAll(req.query);
  res.render('users/index', {
    title: 'Alumni User Directory',
    users,
    search: req.query.search || '',
    activeRole: req.query.role || ''
  });
};

// GET /users/new - Render user creation form
exports.newForm = (req, res) => {
  res.render('users/new', {
    title: 'Register New User',
    error: null,
    formData: {}
  });
};

// POST /users - Create new user from web form
exports.create = (req, res) => {
  try {
    const newUser = userModel.create(req.body);
    res.redirect(`/users/${newUser.id}`);
  } catch (err) {
    res.status(err.status || 400).render('users/new', {
      title: 'Register New User',
      error: err.message,
      formData: req.body
    });
  }
};

// GET /users/:id - Render single user details view
exports.show = (req, res) => {
  const user = userModel.findById(req.params.id);
  if (!user) {
    return res.status(404).render('error', {
      title: 'User Not Found',
      message: `User with ID #${req.params.id} does not exist.`
    });
  }
  res.render('users/show', {
    title: `${user.first_name} ${user.last_name}`,
    user
  });
};

// GET /users/:id/edit - Render user edit form
exports.editForm = (req, res) => {
  const user = userModel.findById(req.params.id);
  if (!user) {
    return res.status(404).render('error', {
      title: 'User Not Found',
      message: `User with ID #${req.params.id} does not exist.`
    });
  }
  res.render('users/edit', {
    title: `Edit ${user.first_name} ${user.last_name}`,
    user,
    error: null
  });
};

// POST /users/:id (or PUT) - Update user from form
exports.update = (req, res) => {
  try {
    const updated = userModel.update(req.params.id, req.body);
    res.redirect(`/users/${updated.id}`);
  } catch (err) {
    const user = userModel.findById(req.params.id) || { id: req.params.id, ...req.body };
    res.status(err.status || 400).render('users/edit', {
      title: 'Edit User',
      user,
      error: err.message
    });
  }
};

// POST /users/:id/delete (or DELETE) - Remove user
exports.delete = (req, res) => {
  try {
    userModel.delete(req.params.id);
    res.redirect('/users');
  } catch (err) {
    res.status(err.status || 404).render('error', {
      title: 'Action Failed',
      message: err.message
    });
  }
};
