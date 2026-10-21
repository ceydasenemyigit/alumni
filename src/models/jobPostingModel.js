/**
 * JobPosting Model
 * Connected to PostgreSQL database with seamless in-memory fallback.
 * Implements N:1 relationship with User (posted_by_user_id) and full CRUD operations.
 */

const db = require('../config/db');

const VALID_EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Remote'];

class JobPostingModel {
  constructor() {
    this.jobPostings = [
      {
        id: 1,
        title: 'Junior Full-Stack Engineer',
        company: 'Global Tech Solutions',
        location: 'Istanbul / Hybrid',
        employment_type: 'Full-Time',
        description: 'Join our core platform engineering team working with Node.js, Express, and PostgreSQL.',
        requirements: 'Proficiency in JavaScript/TypeScript, SQL, and REST APIs.',
        salary_range: '$40,000 - $60,000',
        application_url: 'https://careers.globaltech.example.com/apply/1',
        posted_by_user_id: 1,
        is_active: true,
        deadline: '2026-12-31',
        created_at: new Date('2026-10-01T10:00:00.000Z').toISOString(),
        updated_at: new Date('2026-10-01T10:00:00.000Z').toISOString()
      },
      {
        id: 2,
        title: 'Summer Software Engineering Intern',
        company: 'CloudScale Dynamics',
        location: 'Remote',
        employment_type: 'Internship',
        description: 'Exciting 3-month paid summer internship program for junior/senior computer engineering students.',
        requirements: 'Strong foundational CS knowledge, data structures, and Git experience.',
        salary_range: '$25/hour',
        application_url: 'mailto:internships@cloudscale.example.com',
        posted_by_user_id: 2,
        is_active: true,
        deadline: '2026-05-15',
        created_at: new Date('2026-10-10T12:00:00.000Z').toISOString(),
        updated_at: new Date('2026-10-10T12:00:00.000Z').toISOString()
      }
    ];
    this.nextId = 3;
  }

  formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      title: row.title,
      company: row.company,
      location: row.location || 'Remote',
      employment_type: row.employment_type || 'Full-Time',
      description: row.description,
      requirements: row.requirements || null,
      salary_range: row.salary_range || null,
      application_url: row.application_url || null,
      posted_by_user_id: row.posted_by_user_id ? parseInt(row.posted_by_user_id, 10) : null,
      is_active: row.is_active !== undefined ? Boolean(row.is_active) : true,
      deadline: row.deadline ? (row.deadline instanceof Date ? row.deadline.toISOString().slice(0, 10) : String(row.deadline).slice(0, 10)) : null,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
    };
  }

  // --- CRUD: READ ---

  async findAll(query = {}) {
    try {
      let sql = `
        SELECT id, title, company, location, employment_type, description, requirements, salary_range,
               application_url, posted_by_user_id, is_active, deadline, created_at, updated_at
        FROM job_postings
        WHERE 1=1
      `;
      const params = [];

      if (query.is_active !== undefined) {
        params.push(query.is_active === true || query.is_active === 'true');
        sql += ` AND is_active = $${params.length}`;
      }

      if (query.employment_type) {
        params.push(query.employment_type);
        sql += ` AND LOWER(employment_type) = LOWER($${params.length})`;
      }

      if (query.company) {
        params.push(`%${query.company}%`);
        sql += ` AND company ILIKE $${params.length}`;
      }

      if (query.search) {
        params.push(`%${query.search}%`);
        const idx = params.length;
        sql += ` AND (title ILIKE $${idx} OR company ILIKE $${idx} OR description ILIKE $${idx})`;
      }

      sql += ` ORDER BY id DESC`;

      const res = await db.query(sql, params);
      return res.rows.map(r => this.formatRow(r));
    } catch (e) {
      let result = [...this.jobPostings];

      if (query.is_active !== undefined) {
        const flag = query.is_active === true || query.is_active === 'true';
        result = result.filter(j => j.is_active === flag);
      }

      if (query.employment_type) {
        result = result.filter(j => j.employment_type.toLowerCase() === query.employment_type.toLowerCase());
      }

      if (query.company) {
        result = result.filter(j => j.company.toLowerCase().includes(query.company.toLowerCase()));
      }

      if (query.search) {
        const s = query.search.toLowerCase();
        result = result.filter(j => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s) || j.description.toLowerCase().includes(s));
      }

      return result;
    }
  }

  async findById(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return null;

    try {
      const res = await db.query(`
        SELECT id, title, company, location, employment_type, description, requirements, salary_range,
               application_url, posted_by_user_id, is_active, deadline, created_at, updated_at
        FROM job_postings
        WHERE id = $1
      `, [numId]);
      if (res.rows.length === 0) return null;
      return this.formatRow(res.rows[0]);
    } catch (e) {
      return this.jobPostings.find(j => j.id === numId) || null;
    }
  }

  async findByUserId(userId) {
    const numUserId = parseInt(userId, 10);
    if (isNaN(numUserId)) return [];

    try {
      const res = await db.query(`
        SELECT id, title, company, location, employment_type, description, requirements, salary_range,
               application_url, posted_by_user_id, is_active, deadline, created_at, updated_at
        FROM job_postings
        WHERE posted_by_user_id = $1
        ORDER BY id DESC
      `, [numUserId]);
      return res.rows.map(r => this.formatRow(r));
    } catch (e) {
      return this.jobPostings.filter(j => j.posted_by_user_id === numUserId);
    }
  }

  // --- Relations: JobPosting belongs to User (Poster) (N:1) ---

  async getPoster(jobPostingId) {
    const job = await this.findById(jobPostingId);
    if (!job || !job.posted_by_user_id) return null;
    const userModel = require('./userModel');
    return await userModel.findById(job.posted_by_user_id);
  }

  // --- CRUD: CREATE ---

  async create(data) {
    if (!data.title || !data.company || !data.description) {
      const err = new Error('Title, company, and description are required.');
      err.status = 400;
      throw err;
    }

    const employmentType = data.employment_type || 'Full-Time';
    if (!VALID_EMPLOYMENT_TYPES.includes(employmentType)) {
      const err = new Error(`Invalid employment_type. Must be one of: ${VALID_EMPLOYMENT_TYPES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const postedByUserId = data.posted_by_user_id ? parseInt(data.posted_by_user_id, 10) : null;

    try {
      const res = await db.query(`
        INSERT INTO job_postings (title, company, location, employment_type, description, requirements, salary_range, application_url, posted_by_user_id, is_active, deadline)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, title, company, location, employment_type, description, requirements, salary_range, application_url, posted_by_user_id, is_active, deadline, created_at, updated_at
      `, [
        data.title.trim(),
        data.company.trim(),
        data.location ? data.location.trim() : 'Remote',
        employmentType,
        data.description.trim(),
        data.requirements ? data.requirements.trim() : null,
        data.salary_range ? data.salary_range.trim() : null,
        data.application_url ? data.application_url.trim() : null,
        postedByUserId,
        data.is_active !== undefined ? Boolean(data.is_active) : true,
        data.deadline || null
      ]);
      return this.formatRow(res.rows[0]);
    } catch (e) {
      if (e.status) throw e;
      const newJob = {
        id: this.nextId++,
        title: data.title.trim(),
        company: data.company.trim(),
        location: data.location ? data.location.trim() : 'Remote',
        employment_type: employmentType,
        description: data.description.trim(),
        requirements: data.requirements ? data.requirements.trim() : null,
        salary_range: data.salary_range ? data.salary_range.trim() : null,
        application_url: data.application_url ? data.application_url.trim() : null,
        posted_by_user_id: postedByUserId,
        is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
        deadline: data.deadline || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.jobPostings.push(newJob);
      return newJob;
    }
  }

  // --- CRUD: UPDATE ---

  async update(id, data) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      const err = new Error('Invalid job posting ID.');
      err.status = 400;
      throw err;
    }

    if (data.employment_type && !VALID_EMPLOYMENT_TYPES.includes(data.employment_type)) {
      const err = new Error(`Invalid employment_type. Must be one of: ${VALID_EMPLOYMENT_TYPES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    try {
      const res = await db.query(`
        UPDATE job_postings
        SET title = COALESCE($1, title),
            company = COALESCE($2, company),
            location = COALESCE($3, location),
            employment_type = COALESCE($4, employment_type),
            description = COALESCE($5, description),
            requirements = COALESCE($6, requirements),
            salary_range = COALESCE($7, salary_range),
            application_url = COALESCE($8, application_url),
            is_active = COALESCE($9, is_active),
            deadline = COALESCE($10, deadline),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING id, title, company, location, employment_type, description, requirements, salary_range, application_url, posted_by_user_id, is_active, deadline, created_at, updated_at
      `, [
        data.title ? data.title.trim() : null,
        data.company ? data.company.trim() : null,
        data.location ? data.location.trim() : null,
        data.employment_type || null,
        data.description ? data.description.trim() : null,
        data.requirements !== undefined ? data.requirements : null,
        data.salary_range !== undefined ? data.salary_range : null,
        data.application_url !== undefined ? data.application_url : null,
        data.is_active !== undefined ? Boolean(data.is_active) : null,
        data.deadline !== undefined ? data.deadline : null,
        numId
      ]);

      if (res.rowCount === 0) {
        const err = new Error(`Job posting with ID ${numId} not found.`);
        err.status = 404;
        throw err;
      }
      return this.formatRow(res.rows[0]);
    } catch (e) {
      if (e.status) throw e;
      const idx = this.jobPostings.findIndex(j => j.id === numId);
      if (idx === -1) {
        const err = new Error(`Job posting with ID ${numId} not found.`);
        err.status = 404;
        throw err;
      }
      this.jobPostings[idx] = {
        ...this.jobPostings[idx],
        ...data,
        updated_at: new Date().toISOString()
      };
      return this.jobPostings[idx];
    }
  }

  // --- CRUD: DELETE ---

  async delete(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      const err = new Error('Invalid job posting ID.');
      err.status = 400;
      throw err;
    }

    try {
      const res = await db.query('DELETE FROM job_postings WHERE id = $1 RETURNING id, title, company', [numId]);
      if (res.rowCount === 0) {
        const err = new Error(`Job posting with ID ${numId} not found.`);
        err.status = 404;
        throw err;
      }
      return this.formatRow(res.rows[0]);
    } catch (e) {
      if (e.status) throw e;
      const idx = this.jobPostings.findIndex(j => j.id === numId);
      if (idx === -1) {
        const err = new Error(`Job posting with ID ${numId} not found.`);
        err.status = 404;
        throw err;
      }
      const [deleted] = this.jobPostings.splice(idx, 1);
      return deleted;
    }
  }
}

module.exports = new JobPostingModel();
