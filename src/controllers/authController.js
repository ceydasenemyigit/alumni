const userModel = require('../models/userModel');
const alumniProfileModel = require('../models/alumniProfileModel');
const departmentModel = require('../models/departmentModel');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * AuthController - Handles user registration and authentication workflows
 */

// GET /register - Render the registration page
exports.getRegister = async (req, res) => {
  try {
    const departments = await departmentModel.findAll();
    res.render('auth/register', {
      title: 'Create Your Account — Register',
      departments,
      error: null,
      formData: {},
      success: null
    });
  } catch (err) {
    res.status(500).render('error', {
      title: 'Registration Service Error',
      message: 'Unable to load registration form: ' + err.message
    });
  }
};

// Helper: Validate registration payload
function validateRegistration(data, isWebForm = false) {
  const firstName = (data.first_name || data.firstName || '').trim();
  const lastName = (data.last_name || data.lastName || '').trim();
  const email = (data.email || '').trim().toLowerCase();
  const password = (data.password || '').trim();
  const confirmPassword = (data.confirm_password || data.confirmPassword || '').trim();
  const role = (data.role || 'ALUMNI').trim().toUpperCase();
  const department = (data.department || data.department_name || '').trim();
  const gradYear = data.graduation_year ? parseInt(data.graduation_year, 10) : null;
  const termsAccepted = data.terms_accepted === true || data.terms_accepted === 'true' || data.terms_accepted === 'on' || data.terms_accepted === '1';

  if (!firstName) {
    const err = new Error('First name (Ad) is required.');
    err.status = 400;
    throw err;
  }

  if (!lastName) {
    const err = new Error('Last name (Soyad) is required.');
    err.status = 400;
    throw err;
  }

  if (!email) {
    const err = new Error('Email address is required.');
    err.status = 400;
    throw err;
  }

  if (!EMAIL_REGEX.test(email)) {
    const err = new Error('Please enter a valid institutional or personal email address.');
    err.status = 400;
    throw err;
  }

  if (!password) {
    const err = new Error('Password is required.');
    err.status = 400;
    throw err;
  }

  if (password.length < 6) {
    const err = new Error('Password must be at least 6 characters in length.');
    err.status = 400;
    throw err;
  }

  if (confirmPassword && password !== confirmPassword) {
    const err = new Error('Passwords do not match. Please re-enter your password.');
    err.status = 400;
    throw err;
  }

  if (isWebForm && !termsAccepted) {
    const err = new Error('You must accept the Alumni Honor Code and Terms of Service to create an account.');
    err.status = 400;
    throw err;
  }

  if (!['STUDENT', 'ALUMNI'].includes(role)) {
    const err = new Error('Self-registration role must be either STUDENT or ALUMNI.');
    err.status = 400;
    throw err;
  }

  return {
    firstName,
    lastName,
    email,
    password,
    role,
    department,
    gradYear,
    currentCompany: (data.current_company || '').trim(),
    currentTitle: (data.current_title || '').trim(),
    linkedinUrl: (data.linkedin_url || '').trim(),
    bio: (data.bio || '').trim()
  };
}

// POST /register - Handle HTML form registration submission
exports.postRegister = async (req, res) => {
  let departments = [];
  try {
    departments = await departmentModel.findAll();
  } catch (e) {
    departments = [];
  }

  try {
    const validated = validateRegistration(req.body, true);

    // Check duplicate email
    const existing = await userModel.findByEmail(validated.email);
    if (existing) {
      const err = new Error(`An account with email '${validated.email}' is already registered. Please sign in or use another email.`);
      err.status = 409;
      throw err;
    }

    // Create user
    const newUser = await userModel.create({
      first_name: validated.firstName,
      last_name: validated.lastName,
      email: validated.email,
      password: validated.password,
      role: validated.role,
      department: validated.department,
      graduation_year: validated.gradYear,
      is_verified: true
    });

    // If ALUMNI and profile details provided, initialize 1:1 alumni profile
    if (validated.role === 'ALUMNI' && (validated.currentCompany || validated.currentTitle || validated.linkedinUrl || validated.bio)) {
      try {
        await alumniProfileModel.create({
          user_id: newUser.id,
          current_company: validated.currentCompany,
          current_title: validated.currentTitle,
          linkedin_url: validated.linkedinUrl,
          bio: validated.bio
        });
      } catch (profileErr) {
        console.warn('Alumni profile creation warning:', profileErr.message);
      }
    }

    // Redirect to profile with welcome flag
    res.redirect(`/users/${newUser.id}?registered=true`);
  } catch (err) {
    res.status(err.status || 400).render('auth/register', {
      title: 'Create Your Account — Register',
      departments,
      error: err.message,
      formData: req.body,
      success: null
    });
  }
};

// POST /api/auth/register or /api/register - REST API endpoint for registration
exports.apiRegister = async (req, res) => {
  try {
    const validated = validateRegistration(req.body, false);

    // Check duplicate email
    const existing = await userModel.findByEmail(validated.email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: `An account with email '${validated.email}' is already registered.`
      });
    }

    const newUser = await userModel.create({
      first_name: validated.firstName,
      last_name: validated.lastName,
      email: validated.email,
      password: validated.password,
      role: validated.role,
      department: validated.department,
      graduation_year: validated.gradYear,
      is_verified: true
    });

    let profile = null;
    if (validated.role === 'ALUMNI' && (validated.currentCompany || validated.currentTitle || validated.linkedinUrl || validated.bio)) {
      try {
        profile = await alumniProfileModel.create({
          user_id: newUser.id,
          current_company: validated.currentCompany,
          current_title: validated.currentTitle,
          linkedin_url: validated.linkedinUrl,
          bio: validated.bio
        });
      } catch (profileErr) {
        console.warn('Alumni profile creation warning:', profileErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      data: {
        user: newUser,
        profile: profile
      }
    });
  } catch (err) {
    res.status(err.status || 400).json({
      success: false,
      error: err.status === 409 ? 'Conflict' : 'Validation Error',
      message: err.message
    });
  }
};

// GET /login - Simple companion login page
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Sign In — Alumni Portal',
    error: null,
    registered: req.query.registered === 'true'
  });
};
