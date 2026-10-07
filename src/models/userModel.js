/**
 * User Model (In-Memory without database connection)
 * Implements full CRUD operations and data validation.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ['STUDENT', 'ALUMNI', 'ADMIN'];

class UserModel {
  constructor() {
    this.users = [
      {
        id: 1,
        email: 'emre@example.com',
        first_name: 'Emre',
        last_name: 'Yılmaz',
        role: 'ALUMNI',
        department: 'Computer Engineering',
        graduation_year: 2024,
        is_verified: true,
        created_at: new Date('2026-09-01T10:00:00.000Z').toISOString(),
        updated_at: new Date('2026-09-01T10:00:00.000Z').toISOString()
      },
      {
        id: 2,
        email: 'ceyda@example.com',
        first_name: 'Ceyda',
        last_name: 'Şenyiğit',
        role: 'ALUMNI',
        department: 'Software Engineering',
        graduation_year: 2023,
        is_verified: true,
        created_at: new Date('2026-09-05T12:00:00.000Z').toISOString(),
        updated_at: new Date('2026-09-05T12:00:00.000Z').toISOString()
      }
    ];
    this.nextId = 3;
  }

  // --- CRUD: READ ---

  findAll(query = {}) {
    let result = [...this.users];
    if (query.role) {
      result = result.filter(u => u.role.toLowerCase() === query.role.toLowerCase());
    }
    if (query.department) {
      result = result.filter(u => u.department.toLowerCase().includes(query.department.toLowerCase()));
    }
    if (query.search) {
      const term = query.search.toLowerCase();
      result = result.filter(u =>
        u.first_name.toLowerCase().includes(term) ||
        u.last_name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.department.toLowerCase().includes(term)
      );
    }
    return result;
  }

  findById(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return null;
    return this.users.find(u => u.id === numId) || null;
  }

  findByEmail(email) {
    if (!email) return null;
    const clean = String(email).trim().toLowerCase();
    return this.users.find(u => u.email.toLowerCase() === clean) || null;
  }

  // --- Normalization & Validation Helper ---

  normalizeFields(data) {
    const email = data.email ?? data.mail ?? data['e-mail'];
    const password = data.password ?? data.pass ?? data.sifre;
    let firstName = data.first_name ?? data.firstName ?? data.isim;
    let lastName = data.last_name ?? data.lastName ?? data.soyisim;

    // If 'name' is given as a single string, split into first_name and last_name
    if (!firstName && data.name) {
      const parts = String(data.name).trim().split(' ');
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || '';
    }

    const role = data.role ?? data.rol ?? 'ALUMNI';
    const department = data.department ?? data.bolum ?? '';
    const gradYear = data.graduation_year ?? data.graduationYear ?? data.mezuniyet_yili;
    const isVerified = data.is_verified ?? data.isVerified ?? false;

    return {
      email: email ? String(email).trim().toLowerCase() : '',
      password: password ? String(password).trim() : '',
      first_name: firstName ? String(firstName).trim() : '',
      last_name: lastName ? String(lastName).trim() : '',
      role: String(role).toUpperCase(),
      department: department ? String(department).trim() : '',
      graduation_year: gradYear ? parseInt(gradYear, 10) || null : null,
      is_verified: Boolean(isVerified === true || isVerified === 'true')
    };
  }

  // --- CRUD: CREATE ---

  create(rawData) {
    const fields = this.normalizeFields(rawData);

    if (!fields.email) {
      const err = new Error('E-posta (email) alanı zorunludur.');
      err.status = 400;
      err.type = 'Validation Error';
      throw err;
    }

    if (!EMAIL_REGEX.test(fields.email)) {
      const err = new Error('Geçerli bir e-posta adresi giriniz.');
      err.status = 400;
      err.type = 'Validation Error';
      throw err;
    }

    if (this.findByEmail(fields.email)) {
      const err = new Error('Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut.');
      err.status = 409;
      err.type = 'Conflict';
      throw err;
    }

    if (!VALID_ROLES.includes(fields.role)) {
      const err = new Error(`Geçersiz rol. Kabul edilen roller: ${VALID_ROLES.join(', ')}`);
      err.status = 400;
      err.type = 'Validation Error';
      throw err;
    }

    const newUser = {
      id: this.nextId++,
      email: fields.email,
      first_name: fields.first_name,
      last_name: fields.last_name,
      role: fields.role,
      department: fields.department,
      graduation_year: fields.graduation_year,
      is_verified: fields.is_verified,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.users.push(newUser);
    return newUser;
  }

  // --- CRUD: UPDATE (Full Replace) ---

  update(id, rawData) {
    const numId = parseInt(id, 10);
    const index = this.users.findIndex(u => u.id === numId);
    if (index === -1) {
      const err = new Error(`ID ${numId} olan kullanıcı bulunamadı.`);
      err.status = 404;
      err.type = 'Not Found';
      throw err;
    }

    const fields = this.normalizeFields(rawData);
    const existing = this.users[index];

    let emailToSet = existing.email;
    if (fields.email) {
      if (!EMAIL_REGEX.test(fields.email)) {
        const err = new Error('Geçerli bir e-posta adresi giriniz.');
        err.status = 400;
        err.type = 'Validation Error';
        throw err;
      }
      const duplicate = this.users.find(u => u.id !== numId && u.email.toLowerCase() === fields.email);
      if (duplicate) {
        const err = new Error('Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.');
        err.status = 409;
        err.type = 'Conflict';
        throw err;
      }
      emailToSet = fields.email;
    }

    let roleToSet = existing.role;
    if (fields.role && VALID_ROLES.includes(fields.role)) {
      roleToSet = fields.role;
    }

    const updatedUser = {
      ...existing,
      email: emailToSet,
      first_name: fields.first_name || existing.first_name,
      last_name: fields.last_name || existing.last_name,
      role: roleToSet,
      department: fields.department !== undefined ? fields.department : existing.department,
      graduation_year: fields.graduation_year !== null ? fields.graduation_year : existing.graduation_year,
      is_verified: rawData.is_verified !== undefined ? fields.is_verified : existing.is_verified,
      updated_at: new Date().toISOString()
    };

    this.users[index] = updatedUser;
    return updatedUser;
  }

  // --- CRUD: PATCH (Partial Update) ---

  patch(id, rawData) {
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

    if (rawData.email) {
      const cleanEmail = String(rawData.email).trim().toLowerCase();
      if (!EMAIL_REGEX.test(cleanEmail)) {
        const err = new Error('Geçerli bir e-posta adresi giriniz.');
        err.status = 400;
        err.type = 'Validation Error';
        throw err;
      }
      const duplicate = this.users.find(u => u.id !== numId && u.email.toLowerCase() === cleanEmail);
      if (duplicate) {
        const err = new Error('Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.');
        err.status = 409;
        err.type = 'Conflict';
        throw err;
      }
      patchData.email = cleanEmail;
    }

    if (rawData.first_name !== undefined) patchData.first_name = String(rawData.first_name).trim();
    if (rawData.last_name !== undefined) patchData.last_name = String(rawData.last_name).trim();
    if (rawData.name && !rawData.first_name) {
      const parts = String(rawData.name).trim().split(' ');
      patchData.first_name = parts[0];
      patchData.last_name = parts.slice(1).join(' ') || existing.last_name;
    }

    if (rawData.role) {
      const roleUpper = String(rawData.role).toUpperCase();
      if (!VALID_ROLES.includes(roleUpper)) {
        const err = new Error(`Geçersiz rol. Kabul edilen roller: ${VALID_ROLES.join(', ')}`);
        err.status = 400;
        err.type = 'Validation Error';
        throw err;
      }
      patchData.role = roleUpper;
    }

    if (rawData.department !== undefined) patchData.department = String(rawData.department).trim();
    if (rawData.graduation_year !== undefined) patchData.graduation_year = parseInt(rawData.graduation_year, 10) || null;
    if (rawData.is_verified !== undefined) patchData.is_verified = Boolean(rawData.is_verified === true || rawData.is_verified === 'true');

    patchData.updated_at = new Date().toISOString();

    const updatedUser = { ...existing, ...patchData };
    this.users[index] = updatedUser;
    return updatedUser;
  }

  // --- CRUD: DELETE ---

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

module.exports = new UserModel();
