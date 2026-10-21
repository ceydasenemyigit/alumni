/**
 * Application Model (Action / Associative Table)
 * Resolves Many-to-Many (N:M) relationship between Users (applicants) and JobPostings.
 * Connected to PostgreSQL database with seamless in-memory fallback.
 */

const db = require('../config/db');

const VALID_STATUSES = ['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'];

class ApplicationModel {
  constructor() {
    this.applications = [
      {
        id: 1,
        user_id: 2,
        job_posting_id: 2,
        resume_url: 'https://storage.example.com/resumes/ayse_kaya_cv.pdf',
        cover_letter: 'I am very eager to apply for this summer internship program at CloudScale Dynamics to leverage my CS foundations.',
        status: 'REVIEWING',
        applied_at: new Date('2026-10-11T09:30:00.000Z').toISOString(),
        updated_at: new Date('2026-10-11T09:30:00.000Z').toISOString()
      },
      {
        id: 2,
        user_id: 1,
        job_posting_id: 2,
        resume_url: 'https://storage.example.com/resumes/emre_yilmaz_cv.pdf',
        cover_letter: 'Interested in contributing and mentoring within cloud infrastructure systems.',
        status: 'PENDING',
        applied_at: new Date('2026-10-12T14:15:00.000Z').toISOString(),
        updated_at: new Date('2026-10-12T14:15:00.000Z').toISOString()
      }
    ];
    this.nextId = 3;
  }

  formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      user_id: parseInt(row.user_id, 10),
      job_posting_id: parseInt(row.job_posting_id, 10),
      resume_url: row.resume_url || null,
      cover_letter: row.cover_letter || null,
      status: row.status || 'PENDING',
      applied_at: row.applied_at ? new Date(row.applied_at).toISOString() : new Date().toISOString(),
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
    };
  }

  // --- CRUD: READ ---

  async findAll(query = {}) {
    try {
      let sql = `
        SELECT id, user_id, job_posting_id, resume_url, cover_letter, status, applied_at, updated_at
        FROM applications
        WHERE 1=1
      `;
      const params = [];

      if (query.user_id) {
        params.push(parseInt(query.user_id, 10));
        sql += ` AND user_id = $${params.length}`;
      }

      if (query.job_posting_id) {
        params.push(parseInt(query.job_posting_id, 10));
        sql += ` AND job_posting_id = $${params.length}`;
      }

      if (query.status) {
        params.push(String(query.status).toUpperCase());
        sql += ` AND status = $${params.length}`;
      }

      sql += ` ORDER BY id DESC`;

      const res = await db.query(sql, params);
      return res.rows.map(r => this.formatRow(r));
    } catch (e) {
      let result = [...this.applications];

      if (query.user_id) {
        const uid = parseInt(query.user_id, 10);
        result = result.filter(a => a.user_id === uid);
      }

      if (query.job_posting_id) {
        const jid = parseInt(query.job_posting_id, 10);
        result = result.filter(a => a.job_posting_id === jid);
      }

      if (query.status) {
        const st = String(query.status).toUpperCase();
        result = result.filter(a => a.status === st);
      }

      return result;
    }
  }

  async findById(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return null;

    try {
      const res = await db.query(`
        SELECT id, user_id, job_posting_id, resume_url, cover_letter, status, applied_at, updated_at
        FROM applications
        WHERE id = $1
      `, [numId]);
      if (res.rows.length === 0) return null;
      return this.formatRow(res.rows[0]);
    } catch (e) {
      return this.applications.find(a => a.id === numId) || null;
    }
  }

  async findByUserAndJob(userId, jobPostingId) {
    const uId = parseInt(userId, 10);
    const jId = parseInt(jobPostingId, 10);
    if (isNaN(uId) || isNaN(jId)) return null;

    try {
      const res = await db.query(`
        SELECT id, user_id, job_posting_id, resume_url, cover_letter, status, applied_at, updated_at
        FROM applications
        WHERE user_id = $1 AND job_posting_id = $2
      `, [uId, jId]);
      if (res.rows.length === 0) return null;
      return this.formatRow(res.rows[0]);
    } catch (e) {
      return this.applications.find(a => a.user_id === uId && a.job_posting_id === jId) || null;
    }
  }

  async findByUserId(userId) {
    return await this.findAll({ user_id: userId });
  }

  async findByJobId(jobPostingId) {
    return await this.findAll({ job_posting_id: jobPostingId });
  }

  // --- Relational Queries (Resolving N:M) ---

  async getApplicant(applicationId) {
    const app = await this.findById(applicationId);
    if (!app) return null;
    const userModel = require('./userModel');
    return await userModel.findById(app.user_id);
  }

  async getJobPosting(applicationId) {
    const app = await this.findById(applicationId);
    if (!app) return null;
    const jobPostingModel = require('./jobPostingModel');
    return await jobPostingModel.findById(app.job_posting_id);
  }

  async findWithRelations(applicationId) {
    const app = await this.findById(applicationId);
    if (!app) return null;

    const [applicant, jobPosting] = await Promise.all([
      this.getApplicant(applicationId),
      this.getJobPosting(applicationId)
    ]);

    return {
      ...app,
      applicant,
      job_posting: jobPosting
    };
  }

  // --- CRUD: CREATE ---

  async create(data) {
    const userId = parseInt(data.user_id, 10);
    const jobId = parseInt(data.job_posting_id || data.job_id, 10);

    if (isNaN(userId) || isNaN(jobId)) {
      const err = new Error('Both user_id and job_posting_id are required.');
      err.status = 400;
      throw err;
    }

    const status = data.status ? String(data.status).toUpperCase() : 'PENDING';
    if (!VALID_STATUSES.includes(status)) {
      const err = new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    // Check composite uniqueness
    const existing = await this.findByUserAndJob(userId, jobId);
    if (existing) {
      const err = new Error('Bu ilana daha önce zaten başvuru yaptınız.');
      err.status = 409;
      throw err;
    }

    try {
      const res = await db.query(`
        INSERT INTO applications (user_id, job_posting_id, resume_url, cover_letter, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, job_posting_id, resume_url, cover_letter, status, applied_at, updated_at
      `, [
        userId,
        jobId,
        data.resume_url ? data.resume_url.trim() : null,
        data.cover_letter ? data.cover_letter.trim() : null,
        status
      ]);
      return this.formatRow(res.rows[0]);
    } catch (e) {
      if (e.status) throw e;
      if (e.code === '23505') { // Postgres unique_violation
        const conflictErr = new Error('Bu ilana daha önce zaten başvuru yaptınız.');
        conflictErr.status = 409;
        throw conflictErr;
      }
      const newApp = {
        id: this.nextId++,
        user_id: userId,
        job_posting_id: jobId,
        resume_url: data.resume_url ? data.resume_url.trim() : null,
        cover_letter: data.cover_letter ? data.cover_letter.trim() : null,
        status,
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.applications.push(newApp);
      return newApp;
    }
  }

  // --- CRUD: UPDATE ---

  async update(id, data) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      const err = new Error('Invalid application ID.');
      err.status = 400;
      throw err;
    }

    if (data.status) {
      data.status = String(data.status).toUpperCase();
      if (!VALID_STATUSES.includes(data.status)) {
        const err = new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
        err.status = 400;
        throw err;
      }
    }

    try {
      const res = await db.query(`
        UPDATE applications
        SET status = COALESCE($1, status),
            resume_url = COALESCE($2, resume_url),
            cover_letter = COALESCE($3, cover_letter),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id, user_id, job_posting_id, resume_url, cover_letter, status, applied_at, updated_at
      `, [
        data.status || null,
        data.resume_url ? data.resume_url.trim() : null,
        data.cover_letter ? data.cover_letter.trim() : null,
        numId
      ]);

      if (res.rowCount === 0) {
        const err = new Error(`Application with ID ${numId} not found.`);
        err.status = 404;
        throw err;
      }
      return this.formatRow(res.rows[0]);
    } catch (e) {
      if (e.status) throw e;
      const idx = this.applications.findIndex(a => a.id === numId);
      if (idx === -1) {
        const err = new Error(`Application with ID ${numId} not found.`);
        err.status = 404;
        throw err;
      }
      this.applications[idx] = {
        ...this.applications[idx],
        ...data,
        updated_at: new Date().toISOString()
      };
      return this.applications[idx];
    }
  }

  async updateStatus(id, status) {
    return await this.update(id, { status });
  }

  // --- CRUD: DELETE ---

  async delete(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      const err = new Error('Invalid application ID.');
      err.status = 400;
      throw err;
    }

    try {
      const res = await db.query('DELETE FROM applications WHERE id = $1 RETURNING id, user_id, job_posting_id', [numId]);
      if (res.rowCount === 0) {
        const err = new Error(`Application with ID ${numId} not found.`);
        err.status = 404;
        throw err;
      }
      return this.formatRow(res.rows[0]);
    } catch (e) {
      if (e.status) throw e;
      const idx = this.applications.findIndex(a => a.id === numId);
      if (idx === -1) {
        const err = new Error(`Application with ID ${numId} not found.`);
        err.status = 404;
        throw err;
      }
      const [deleted] = this.applications.splice(idx, 1);
      return deleted;
    }
  }
}

module.exports = new ApplicationModel();
