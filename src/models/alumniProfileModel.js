/**
 * AlumniProfile Model
 * Connected to PostgreSQL database with seamless in-memory fallback.
 * Implements 1:1 relationship with User and full CRUD operations.
 */

const db = require('../config/db');

class AlumniProfileModel {
  constructor() {
    this.profiles = [
      {
        id: 1,
        user_id: 1,
        current_company: 'Global Tech Solutions',
        current_title: 'Software Engineer',
        industry: 'Information Technology',
        city: 'Istanbul',
        country: 'Turkey',
        linkedin_url: 'https://linkedin.com/in/emreyilmaz',
        github_url: 'https://github.com/emreyilmaz',
        bio: 'Passionate full-stack developer and Istanbul University alumnus.',
        created_at: new Date('2026-09-01T10:00:00.000Z').toISOString(),
        updated_at: new Date('2026-09-01T10:00:00.000Z').toISOString()
      },
      {
        id: 2,
        user_id: 2,
        current_company: 'CloudScale Dynamics',
        current_title: 'DevOps Engineer',
        industry: 'Cloud Computing',
        city: 'Istanbul',
        country: 'Turkey',
        linkedin_url: 'https://linkedin.com/in/ceydasenyiğit',
        github_url: 'https://github.com/ceydasenemyigit',
        bio: 'Cloud architecture and infrastructure enthusiast.',
        created_at: new Date('2026-09-05T12:00:00.000Z').toISOString(),
        updated_at: new Date('2026-09-05T12:00:00.000Z').toISOString()
      }
    ];
    this.nextId = 3;
  }

  formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      user_id: row.user_id,
      current_company: row.current_company,
      current_title: row.current_title,
      industry: row.industry,
      city: row.city,
      country: row.country || 'Turkey',
      linkedin_url: row.linkedin_url,
      github_url: row.github_url,
      bio: row.bio,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
    };
  }

  // --- CRUD: READ ---

  async findAll() {
    try {
      const res = await db.query(`
        SELECT id, user_id, current_company, current_title, industry, city, country, linkedin_url, github_url, bio, created_at, updated_at
        FROM alumni_profiles
        ORDER BY id ASC
      `);
      return res.rows.map(r => this.formatRow(r));
    } catch (e) {
      return [...this.profiles];
    }
  }

  async findById(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return null;

    try {
      const res = await db.query(`
        SELECT id, user_id, current_company, current_title, industry, city, country, linkedin_url, github_url, bio, created_at, updated_at
        FROM alumni_profiles
        WHERE id = $1
      `, [numId]);
      if (res.rows.length === 0) return null;
      return this.formatRow(res.rows[0]);
    } catch (e) {
      return this.profiles.find(p => p.id === numId) || null;
    }
  }

  async findByUserId(userId) {
    const numUserId = parseInt(userId, 10);
    if (isNaN(numUserId)) return null;

    try {
      const res = await db.query(`
        SELECT id, user_id, current_company, current_title, industry, city, country, linkedin_url, github_url, bio, created_at, updated_at
        FROM alumni_profiles
        WHERE user_id = $1
      `, [numUserId]);
      if (res.rows.length === 0) return null;
      return this.formatRow(res.rows[0]);
    } catch (e) {
      return this.profiles.find(p => p.user_id === numUserId) || null;
    }
  }

  // --- Relations: AlumniProfile belongs to User (1:1) ---

  async getUser(userIdOrProfileId) {
    const profile = await this.findById(userIdOrProfileId) || await this.findByUserId(userIdOrProfileId);
    if (!profile) return null;
    const userModel = require('./userModel');
    return await userModel.findById(profile.user_id);
  }

  // --- CRUD: CREATE ---

  async create(data) {
    const userId = parseInt(data.user_id, 10);
    if (isNaN(userId)) {
      const err = new Error('Valid user_id is required.');
      err.status = 400;
      throw err;
    }

    try {
      const res = await db.query(`
        INSERT INTO alumni_profiles (user_id, current_company, current_title, industry, city, country, linkedin_url, github_url, bio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, user_id, current_company, current_title, industry, city, country, linkedin_url, github_url, bio, created_at, updated_at
      `, [
        userId,
        data.current_company || null,
        data.current_title || null,
        data.industry || null,
        data.city || null,
        data.country || 'Turkey',
        data.linkedin_url || null,
        data.github_url || null,
        data.bio || null
      ]);
      return this.formatRow(res.rows[0]);
    } catch (e) {
      if (e.status) throw e;
      const newProfile = {
        id: this.nextId++,
        user_id: userId,
        current_company: data.current_company || '',
        current_title: data.current_title || '',
        industry: data.industry || '',
        city: data.city || '',
        country: data.country || 'Turkey',
        linkedin_url: data.linkedin_url || '',
        github_url: data.github_url || '',
        bio: data.bio || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.profiles.push(newProfile);
      return newProfile;
    }
  }

  // --- CRUD: UPDATE ---

  async update(userId, data) {
    const numUserId = parseInt(userId, 10);
    if (isNaN(numUserId)) {
      const err = new Error('Valid user_id is required.');
      err.status = 400;
      throw err;
    }

    try {
      const res = await db.query(`
        UPDATE alumni_profiles
        SET current_company = COALESCE($1, current_company),
            current_title = COALESCE($2, current_title),
            industry = COALESCE($3, industry),
            city = COALESCE($4, city),
            country = COALESCE($5, country),
            linkedin_url = COALESCE($6, linkedin_url),
            github_url = COALESCE($7, github_url),
            bio = COALESCE($8, bio),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $9
        RETURNING id, user_id, current_company, current_title, industry, city, country, linkedin_url, github_url, bio, created_at, updated_at
      `, [
        data.current_company || null,
        data.current_title || null,
        data.industry || null,
        data.city || null,
        data.country || null,
        data.linkedin_url || null,
        data.github_url || null,
        data.bio || null,
        numUserId
      ]);

      if (res.rowCount === 0) {
        const err = new Error(`Alumni profile for user_id ${numUserId} not found.`);
        err.status = 404;
        throw err;
      }
      return this.formatRow(res.rows[0]);
    } catch (e) {
      if (e.status) throw e;
      const idx = this.profiles.findIndex(p => p.user_id === numUserId);
      if (idx === -1) {
        const err = new Error(`Alumni profile for user_id ${numUserId} not found.`);
        err.status = 404;
        throw err;
      }
      this.profiles[idx] = {
        ...this.profiles[idx],
        ...data,
        updated_at: new Date().toISOString()
      };
      return this.profiles[idx];
    }
  }

  // --- CRUD: DELETE ---

  async delete(userId) {
    const numUserId = parseInt(userId, 10);
    if (isNaN(numUserId)) {
      const err = new Error('Valid user_id is required.');
      err.status = 400;
      throw err;
    }

    try {
      const res = await db.query('DELETE FROM alumni_profiles WHERE user_id = $1 RETURNING id, user_id', [numUserId]);
      if (res.rowCount === 0) {
        const err = new Error(`Alumni profile for user_id ${numUserId} not found.`);
        err.status = 404;
        throw err;
      }
      return this.formatRow(res.rows[0]);
    } catch (e) {
      if (e.status) throw e;
      const idx = this.profiles.findIndex(p => p.user_id === numUserId);
      if (idx === -1) {
        const err = new Error(`Alumni profile for user_id ${numUserId} not found.`);
        err.status = 404;
        throw err;
      }
      const [deleted] = this.profiles.splice(idx, 1);
      return deleted;
    }
  }
}

module.exports = new AlumniProfileModel();
