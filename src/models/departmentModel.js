/**
 * Department Model
 * Connected to PostgreSQL database with seamless in-memory fallback.
 * Implements CRUD operations and relational queries.
 */

const db = require('../config/db');

class DepartmentModel {
  constructor() {
    this.departments = [
      { id: 1, name: 'Computer Engineering', faculty: 'Faculty of Engineering', created_at: new Date('2026-09-01T10:00:00.000Z').toISOString() },
      { id: 2, name: 'Electrical & Electronics Engineering', faculty: 'Faculty of Engineering', created_at: new Date('2026-09-01T10:00:00.000Z').toISOString() },
      { id: 3, name: 'Industrial Engineering', faculty: 'Faculty of Engineering', created_at: new Date('2026-09-01T10:00:00.000Z').toISOString() },
      { id: 4, name: 'Business Administration', faculty: 'Faculty of Economics and Administrative Sciences', created_at: new Date('2026-09-01T10:00:00.000Z').toISOString() },
      { id: 5, name: 'Software Engineering', faculty: 'Faculty of Engineering', created_at: new Date('2026-09-01T10:00:00.000Z').toISOString() }
    ];
    this.nextId = 6;
  }

  formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      faculty: row.faculty,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
    };
  }

  // --- CRUD: READ ---

  async findAll() {
    try {
      const res = await db.query('SELECT id, name, faculty, created_at FROM departments ORDER BY id ASC');
      return res.rows.map(r => this.formatRow(r));
    } catch (e) {
      return [...this.departments];
    }
  }

  async findById(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return null;

    try {
      const res = await db.query('SELECT id, name, faculty, created_at FROM departments WHERE id = $1', [numId]);
      if (res.rows.length === 0) return null;
      return this.formatRow(res.rows[0]);
    } catch (e) {
      return this.departments.find(d => d.id === numId) || null;
    }
  }

  async findByName(name) {
    if (!name) return null;
    try {
      const res = await db.query('SELECT id, name, faculty, created_at FROM departments WHERE LOWER(name) = LOWER($1)', [name.trim()]);
      if (res.rows.length === 0) return null;
      return this.formatRow(res.rows[0]);
    } catch (e) {
      return this.departments.find(d => d.name.toLowerCase() === name.trim().toLowerCase()) || null;
    }
  }

  // --- Relations: Department has many Users (1:N) ---

  async getUsers(departmentId) {
    const numId = parseInt(departmentId, 10);
    if (isNaN(numId)) return [];

    try {
      const res = await db.query(`
        SELECT id, email, first_name, last_name, role, department_name, graduation_year, is_verified, created_at, updated_at
        FROM users
        WHERE department_id = $1
        ORDER BY id ASC
      `, [numId]);
      return res.rows;
    } catch (e) {
      const userModel = require('./userModel');
      const dept = this.departments.find(d => d.id === numId);
      if (!dept) return [];
      return userModel.users.filter(u => u.department === dept.name || u.department_name === dept.name);
    }
  }

  // --- CRUD: CREATE ---

  async create(data) {
    if (!data.name || !data.faculty) {
      const err = new Error('Department name and faculty are required.');
      err.status = 400;
      throw err;
    }

    try {
      const res = await db.query(`
        INSERT INTO departments (name, faculty)
        VALUES ($1, $2)
        RETURNING id, name, faculty, created_at
      `, [data.name.trim(), data.faculty.trim()]);
      return this.formatRow(res.rows[0]);
    } catch (e) {
      if (e.status) throw e;
      const newDept = {
        id: this.nextId++,
        name: data.name.trim(),
        faculty: data.faculty.trim(),
        created_at: new Date().toISOString()
      };
      this.departments.push(newDept);
      return newDept;
    }
  }

  // --- CRUD: UPDATE ---

  async update(id, data) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      const err = new Error('Invalid department ID.');
      err.status = 400;
      throw err;
    }

    try {
      const res = await db.query(`
        UPDATE departments
        SET name = COALESCE($1, name),
            faculty = COALESCE($2, faculty)
        WHERE id = $3
        RETURNING id, name, faculty, created_at
      `, [data.name ? data.name.trim() : null, data.faculty ? data.faculty.trim() : null, numId]);

      if (res.rowCount === 0) {
        const err = new Error(`Department with ID ${numId} not found.`);
        err.status = 404;
        throw err;
      }
      return this.formatRow(res.rows[0]);
    } catch (e) {
      if (e.status) throw e;
      const idx = this.departments.findIndex(d => d.id === numId);
      if (idx === -1) {
        const err = new Error(`Department with ID ${numId} not found.`);
        err.status = 404;
        throw err;
      }
      if (data.name) this.departments[idx].name = data.name.trim();
      if (data.faculty) this.departments[idx].faculty = data.faculty.trim();
      return this.departments[idx];
    }
  }

  // --- CRUD: DELETE ---

  async delete(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      const err = new Error('Invalid department ID.');
      err.status = 400;
      throw err;
    }

    try {
      const res = await db.query('DELETE FROM departments WHERE id = $1 RETURNING id, name, faculty, created_at', [numId]);
      if (res.rowCount === 0) {
        const err = new Error(`Department with ID ${numId} not found.`);
        err.status = 404;
        throw err;
      }
      return this.formatRow(res.rows[0]);
    } catch (e) {
      if (e.status) throw e;
      const idx = this.departments.findIndex(d => d.id === numId);
      if (idx === -1) {
        const err = new Error(`Department with ID ${numId} not found.`);
        err.status = 404;
        throw err;
      }
      const [deleted] = this.departments.splice(idx, 1);
      return deleted;
    }
  }
}

module.exports = new DepartmentModel();
