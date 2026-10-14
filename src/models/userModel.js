/**
 * User Model
 * Connected to PostgreSQL database with seamless in-memory fallback.
 * Implements full CRUD operations, data validation, and SQL queries.
 */

const db = require('../config/db');

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
        department_name: 'Computer Engineering',
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
        department_name: 'Software Engineering',
        graduation_year: 2023,
        is_verified: true,
        created_at: new Date('2026-09-05T12:00:00.000Z').toISOString(),
        updated_at: new Date('2026-09-05T12:00:00.000Z').toISOString()
      }
    ];
    this.nextId = 3;
    this.useDb = null; // cached connection state
  }

  async checkDbConnection() {
    try {
      await db.query('SELECT 1 FROM users LIMIT 1');
      return true;
    } catch (e) {
      return false;
    }
  }

  formatUserRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      role: row.role,
      department: row.department_name || row.department || '',
      department_name: row.department_name || row.department || '',
      graduation_year: row.graduation_year,
      is_verified: row.is_verified,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
    };
  }

  // --- CRUD: READ ---

  async findAll(query = {}) {
    try {
      let sql = `
        SELECT id, email, first_name, last_name, role, department_name, graduation_year, is_verified, created_at, updated_at
        FROM users
        WHERE 1=1
      `;
      const params = [];

      if (query.role) {
        params.push(String(query.role).toUpperCase());
        sql += ` AND role = $${params.length}`;
      }
      if (query.department) {
        params.push(`%${query.department}%`);
        sql += ` AND department_name ILIKE $${params.length}`;
      }
      if (query.search) {
        params.push(`%${query.search}%`);
        const idx = params.length;
        sql += ` AND (first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR email ILIKE $${idx} OR department_name ILIKE $${idx})`;
      }

      sql += ` ORDER BY id ASC`;

      const result = await db.query(sql, params);
      return result.rows.map(r => this.formatUserRow(r));
    } catch (dbErr) {
      // In-memory fallback
      let result = [...this.users];
      if (query.role) {
        result = result.filter(u => u.role.toLowerCase() === query.role.toLowerCase());
      }
      if (query.department) {
        result = result.filter(u => (u.department || '').toLowerCase().includes(query.department.toLowerCase()));
      }
      if (query.search) {
        const term = query.search.toLowerCase();
        result = result.filter(u =>
          (u.first_name || '').toLowerCase().includes(term) ||
          (u.last_name || '').toLowerCase().includes(term) ||
          (u.email || '').toLowerCase().includes(term) ||
          (u.department || '').toLowerCase().includes(term)
        );
      }
      return result;
    }
  }

  async findById(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return null;

    try {
      const res = await db.query(
        `SELECT id, email, first_name, last_name, role, department_name, graduation_year, is_verified, created_at, updated_at
         FROM users WHERE id = $1`,
        [numId]
      );
      if (res.rowCount > 0) {
        return this.formatUserRow(res.rows[0]);
      }
      return null;
    } catch (dbErr) {
      return this.users.find(u => u.id === numId) || null;
    }
  }

  async findByEmail(email) {
    if (!email) return null;
    const clean = String(email).trim().toLowerCase();

    try {
      const res = await db.query(
        `SELECT id, email, first_name, last_name, role, department_name, graduation_year, is_verified, created_at, updated_at
         FROM users WHERE LOWER(email) = $1`,
        [clean]
      );
      if (res.rowCount > 0) {
        return this.formatUserRow(res.rows[0]);
      }
      return null;
    } catch (dbErr) {
      return this.users.find(u => u.email.toLowerCase() === clean) || null;
    }
  }

  // --- Normalization & Validation Helper ---

  normalizeFields(data) {
    const email = data.email ?? data.mail ?? data['e-mail'];
    const password = data.password ?? data.pass ?? data.sifre;
    let firstName = data.first_name ?? data.firstName ?? data.isim;
    let lastName = data.last_name ?? data.lastName ?? data.soyisim;

    if (!firstName && data.name) {
      const parts = String(data.name).trim().split(' ');
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || '';
    }

    const role = data.role ?? data.rol ?? 'ALUMNI';
    const department = data.department ?? data.department_name ?? data.bolum ?? '';
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

  async create(rawData) {
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

    if (!VALID_ROLES.includes(fields.role)) {
      const err = new Error(`Geçersiz rol. Kabul edilen roller: ${VALID_ROLES.join(', ')}`);
      err.status = 400;
      err.type = 'Validation Error';
      throw err;
    }

    // Try database insertion
    try {
      const existing = await this.findByEmail(fields.email);
      if (existing) {
        const err = new Error('Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut.');
        err.status = 409;
        err.type = 'Conflict';
        throw err;
      }

      const res = await db.query(`
        INSERT INTO users (email, first_name, last_name, role, department_name, graduation_year, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, email, first_name, last_name, role, department_name, graduation_year, is_verified, created_at, updated_at;
      `, [
        fields.email,
        fields.first_name,
        fields.last_name,
        fields.role,
        fields.department,
        fields.graduation_year,
        fields.is_verified
      ]);

      const newUser = this.formatUserRow(res.rows[0]);
      this.users.push(newUser);
      return newUser;
    } catch (dbErr) {
      if (dbErr.status) throw dbErr; // Re-throw validation / conflict error

      // In-memory fallback
      if (this.users.some(u => u.email.toLowerCase() === fields.email)) {
        const err = new Error('Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut.');
        err.status = 409;
        err.type = 'Conflict';
        throw err;
      }

      const newUser = {
        id: this.nextId++,
        email: fields.email,
        first_name: fields.first_name,
        last_name: fields.last_name,
        role: fields.role,
        department: fields.department,
        department_name: fields.department,
        graduation_year: fields.graduation_year,
        is_verified: fields.is_verified,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.users.push(newUser);
      return newUser;
    }
  }

  // --- CRUD: UPDATE (Full Replace) ---

  async update(id, rawData) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      const err = new Error('Geçersiz kullanıcı ID formatı.');
      err.status = 400;
      throw err;
    }

    const fields = this.normalizeFields(rawData);

    try {
      const existingRes = await db.query(`SELECT * FROM users WHERE id = $1`, [numId]);
      if (existingRes.rowCount === 0) {
        const err = new Error(`ID ${numId} olan kullanıcı bulunamadı.`);
        err.status = 404;
        err.type = 'Not Found';
        throw err;
      }

      const existing = existingRes.rows[0];
      let emailToSet = existing.email;

      if (fields.email) {
        if (!EMAIL_REGEX.test(fields.email)) {
          const err = new Error('Geçerli bir e-posta adresi giriniz.');
          err.status = 400;
          throw err;
        }
        const dupCheck = await db.query(`SELECT id FROM users WHERE LOWER(email) = $1 AND id != $2`, [fields.email, numId]);
        if (dupCheck.rowCount > 0) {
          const err = new Error('Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.');
          err.status = 409;
          throw err;
        }
        emailToSet = fields.email;
      }

      let roleToSet = existing.role;
      if (fields.role && VALID_ROLES.includes(fields.role)) {
        roleToSet = fields.role;
      }

      const res = await db.query(`
        UPDATE users
        SET email = $1, first_name = $2, last_name = $3, role = $4, department_name = $5,
            graduation_year = $6, is_verified = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING id, email, first_name, last_name, role, department_name, graduation_year, is_verified, created_at, updated_at;
      `, [
        emailToSet,
        fields.first_name || existing.first_name,
        fields.last_name || existing.last_name,
        roleToSet,
        fields.department !== undefined ? fields.department : existing.department_name,
        fields.graduation_year !== null ? fields.graduation_year : existing.graduation_year,
        rawData.is_verified !== undefined ? fields.is_verified : existing.is_verified,
        numId
      ]);

      const updated = this.formatUserRow(res.rows[0]);
      // Sync in-memory
      const idx = this.users.findIndex(u => u.id === numId);
      if (idx !== -1) this.users[idx] = updated;
      return updated;
    } catch (dbErr) {
      if (dbErr.status) throw dbErr;

      // In-memory fallback
      const index = this.users.findIndex(u => u.id === numId);
      if (index === -1) {
        const err = new Error(`ID ${numId} olan kullanıcı bulunamadı.`);
        err.status = 404;
        err.type = 'Not Found';
        throw err;
      }

      const existing = this.users[index];
      let emailToSet = existing.email;
      if (fields.email) {
        if (!EMAIL_REGEX.test(fields.email)) {
          const err = new Error('Geçerli bir e-posta adresi giriniz.');
          err.status = 400;
          throw err;
        }
        const duplicate = this.users.find(u => u.id !== numId && u.email.toLowerCase() === fields.email);
        if (duplicate) {
          const err = new Error('Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.');
          err.status = 409;
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
        department_name: fields.department !== undefined ? fields.department : existing.department,
        graduation_year: fields.graduation_year !== null ? fields.graduation_year : existing.graduation_year,
        is_verified: rawData.is_verified !== undefined ? fields.is_verified : existing.is_verified,
        updated_at: new Date().toISOString()
      };

      this.users[index] = updatedUser;
      return updatedUser;
    }
  }

  // --- CRUD: PATCH (Partial Update) ---

  async patch(id, rawData) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      const err = new Error('Geçersiz kullanıcı ID formatı.');
      err.status = 400;
      throw err;
    }

    try {
      const existing = await this.findById(numId);
      if (!existing) {
        const err = new Error(`ID ${numId} olan kullanıcı bulunamadı.`);
        err.status = 404;
        throw err;
      }

      const updateData = {
        email: rawData.email !== undefined ? rawData.email : existing.email,
        first_name: rawData.first_name !== undefined ? rawData.first_name : (rawData.name ? String(rawData.name).split(' ')[0] : existing.first_name),
        last_name: rawData.last_name !== undefined ? rawData.last_name : (rawData.name ? String(rawData.name).split(' ').slice(1).join(' ') : existing.last_name),
        role: rawData.role !== undefined ? rawData.role : existing.role,
        department: rawData.department !== undefined ? rawData.department : existing.department,
        graduation_year: rawData.graduation_year !== undefined ? rawData.graduation_year : existing.graduation_year,
        is_verified: rawData.is_verified !== undefined ? rawData.is_verified : existing.is_verified
      };

      return await this.update(numId, updateData);
    } catch (err) {
      if (err.status) throw err;

      // In-memory fallback
      const index = this.users.findIndex(u => u.id === numId);
      if (index === -1) {
        const e = new Error(`ID ${numId} olan kullanıcı bulunamadı.`);
        e.status = 404;
        throw e;
      }
      return this.update(numId, { ...this.users[index], ...rawData });
    }
  }

  // --- CRUD: DELETE ---

  async delete(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      const err = new Error('Geçersiz kullanıcı ID formatı.');
      err.status = 400;
      throw err;
    }

    try {
      const res = await db.query(`
        DELETE FROM users WHERE id = $1
        RETURNING id, email, first_name, last_name, role, department_name, graduation_year, is_verified, created_at, updated_at;
      `, [numId]);

      if (res.rowCount === 0) {
        const err = new Error(`ID ${numId} olan kullanıcı bulunamadı.`);
        err.status = 404;
        throw err;
      }

      const deleted = this.formatUserRow(res.rows[0]);
      const idx = this.users.findIndex(u => u.id === numId);
      if (idx !== -1) this.users.splice(idx, 1);
      return deleted;
    } catch (dbErr) {
      if (dbErr.status) throw dbErr;

      // In-memory fallback
      const index = this.users.findIndex(u => u.id === numId);
      if (index === -1) {
        const err = new Error(`ID ${numId} olan kullanıcı bulunamadı.`);
        err.status = 404;
        throw err;
      }

      const [deleted] = this.users.splice(index, 1);
      return deleted;
    }
  }
}

module.exports = new UserModel();
