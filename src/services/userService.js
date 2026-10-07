/**
 * User Service - In-Memory Storage & Business Logic
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ['STUDENT', 'ALUMNI', 'ADMIN'];

class UserService {
  constructor() {
    this.users = [];
    this.autoIncrementId = 1;
  }

  reset() {
    this.users = [];
    this.autoIncrementId = 1;
  }

  getAll() {
    return this.users;
  }

  getById(id) {
    const numId = parseInt(id, 10);
    return this.users.find(u => u.id === numId) || null;
  }

  validateEmail(email) {
    if (!email || !String(email).trim()) {
      return { valid: false, message: 'E-posta (email) alanı zorunludur.' };
    }
    const cleanEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return { valid: false, message: 'Geçerli bir e-posta adresi giriniz.' };
    }
    return { valid: true, email: cleanEmail };
  }

  create(fields) {
    const {
      email,
      password,
      first_name,
      last_name,
      role = 'ALUMNI',
      department = '',
      graduation_year = null,
      is_verified = false
    } = fields;

    // Validate email
    const emailCheck = this.validateEmail(email);
    if (!emailCheck.valid) {
      const err = new Error(emailCheck.message);
      err.status = 400;
      err.type = 'Validation Error';
      throw err;
    }

    // Check duplicate email
    const exists = this.users.some(u => u.email.toLowerCase() === emailCheck.email);
    if (exists) {
      const err = new Error('Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut.');
      err.status = 409;
      err.type = 'Conflict';
      throw err;
    }

    // Role check
    const normalizedRole = String(role).toUpperCase();
    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      const err = new Error(`Geçersiz rol. Kabul edilen roller: ${ALLOWED_ROLES.join(', ')}`);
      err.status = 400;
      err.type = 'Validation Error';
      throw err;
    }

    const newUser = {
      id: this.autoIncrementId++,
      email: emailCheck.email,
      first_name: first_name ? String(first_name).trim() : '',
      last_name: last_name ? String(last_name).trim() : '',
      role: normalizedRole,
      department: department ? String(department).trim() : '',
      graduation_year: graduation_year ? parseInt(graduation_year, 10) || null : null,
      is_verified: Boolean(is_verified === true || is_verified === 'true'),
      created_at: new Date().toISOString()
    };

    this.users.push(newUser);
    return newUser;
  }

  update(id, fields) {
    const numId = parseInt(id, 10);
    const index = this.users.findIndex(u => u.id === numId);
    if (index === -1) {
      const err = new Error(`ID ${numId} olan kullanıcı bulunamadı.`);
      err.status = 404;
      err.type = 'Not Found';
      throw err;
    }

    const existing = this.users[index];
    const { email, first_name, last_name, role, department, graduation_year, is_verified } = fields;

    let updatedEmail = existing.email;
    if (email !== undefined && email !== null) {
      const emailCheck = this.validateEmail(email);
      if (!emailCheck.valid) {
        const err = new Error(emailCheck.message);
        err.status = 400;
        err.type = 'Validation Error';
        throw err;
      }
      const duplicate = this.users.find(u => u.id !== numId && u.email.toLowerCase() === emailCheck.email);
      if (duplicate) {
        const err = new Error('Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.');
        err.status = 409;
        err.type = 'Conflict';
        throw err;
      }
      updatedEmail = emailCheck.email;
    }

    let updatedRole = existing.role;
    if (role !== undefined && role !== null) {
      const normalizedRole = String(role).toUpperCase();
      if (!ALLOWED_ROLES.includes(normalizedRole)) {
        const err = new Error(`Geçersiz rol. Kabul edilen roller: ${ALLOWED_ROLES.join(', ')}`);
        err.status = 400;
        err.type = 'Validation Error';
        throw err;
      }
      updatedRole = normalizedRole;
    }

    const updatedUser = {
      ...existing,
      email: updatedEmail,
      first_name: first_name !== undefined ? String(first_name).trim() : '',
      last_name: last_name !== undefined ? String(last_name).trim() : '',
      role: updatedRole,
      department: department !== undefined ? String(department).trim() : '',
      graduation_year: graduation_year !== undefined ? (parseInt(graduation_year, 10) || null) : null,
      is_verified: is_verified !== undefined ? Boolean(is_verified === true || is_verified === 'true') : existing.is_verified,
      updated_at: new Date().toISOString()
    };

    this.users[index] = updatedUser;
    return updatedUser;
  }

  patch(id, fields) {
    const numId = parseInt(id, 10);
    const index = this.users.findIndex(u => u.id === numId);
    if (index === -1) {
      const err = new Error(`ID ${numId} olan kullanıcı bulunamadı.`);
      err.status = 404;
      err.type = 'Not Found';
      throw err;
    }

    const existing = this.users[index];
    const patchData = {};

    if (fields.email !== undefined && fields.email !== null) {
      const emailCheck = this.validateEmail(fields.email);
      if (!emailCheck.valid) {
        const err = new Error(emailCheck.message);
        err.status = 400;
        err.type = 'Validation Error';
        throw err;
      }
      const duplicate = this.users.find(u => u.id !== numId && u.email.toLowerCase() === emailCheck.email);
      if (duplicate) {
        const err = new Error('Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.');
        err.status = 409;
        err.type = 'Conflict';
        throw err;
      }
      patchData.email = emailCheck.email;
    }

    if (fields.role !== undefined && fields.role !== null) {
      const normalizedRole = String(fields.role).toUpperCase();
      if (!ALLOWED_ROLES.includes(normalizedRole)) {
        const err = new Error(`Geçersiz rol. Kabul edilen roller: ${ALLOWED_ROLES.join(', ')}`);
        err.status = 400;
        err.type = 'Validation Error';
        throw err;
      }
      patchData.role = normalizedRole;
    }

    if (fields.first_name !== undefined && fields.first_name !== null) {
      patchData.first_name = String(fields.first_name).trim();
    }

    if (fields.last_name !== undefined && fields.last_name !== null) {
      patchData.last_name = String(fields.last_name).trim();
    }

    if (fields.department !== undefined && fields.department !== null) {
      patchData.department = String(fields.department).trim();
    }

    if (fields.graduation_year !== undefined && fields.graduation_year !== null) {
      patchData.graduation_year = parseInt(fields.graduation_year, 10) || null;
    }

    if (fields.is_verified !== undefined && fields.is_verified !== null) {
      patchData.is_verified = Boolean(fields.is_verified === true || fields.is_verified === 'true');
    }

    patchData.updated_at = new Date().toISOString();

    const updatedUser = {
      ...existing,
      ...patchData
    };

    this.users[index] = updatedUser;
    return updatedUser;
  }

  delete(id) {
    const numId = parseInt(id, 10);
    const index = this.users.findIndex(u => u.id === numId);
    if (index === -1) {
      const err = new Error(`ID ${numId} olan kullanıcı bulunamadı.`);
      err.status = 404;
      err.type = 'Not Found';
      throw err;
    }

    const [deleted] = this.users.splice(index, 1);
    return deleted;
  }
}

module.exports = new UserService();
