/**
 * Announcement Model
 * Connected to PostgreSQL database with seamless in-memory fallback.
 * Provides full CRUD helper functions and SQL operations.
 */

const db = require('../config/db');

class AnnouncementModel {
  constructor() {
    this.announcements = [
      {
        id: 1,
        title: 'Annual Alumni Homecoming 2026',
        content: 'Join us for the annual Istanbul University Alumni Gathering on campus with keynote speakers, networking sessions, and gala dinner.',
        author: 'Alumni Relations Office',
        category: 'Event',
        createdAt: new Date('2026-10-01T09:00:00.000Z').toISOString(),
        updatedAt: new Date('2026-10-01T09:00:00.000Z').toISOString()
      },
      {
        id: 2,
        title: 'Tech Mentorship Program Applications Open',
        content: 'We are pairing recent graduates with experienced alumni in the tech industry. Applications close by the end of this month.',
        author: 'Career Development Center',
        category: 'Career',
        createdAt: new Date('2026-10-05T11:30:00.000Z').toISOString(),
        updatedAt: new Date('2026-10-05T11:30:00.000Z').toISOString()
      },
      {
        id: 3,
        title: 'Campus Library Digital Access for Alumni',
        content: 'All registered alumni now have off-campus digital access to university academic journals and research repositories.',
        author: 'University Library',
        category: 'General',
        createdAt: new Date('2026-10-10T14:15:00.000Z').toISOString(),
        updatedAt: new Date('2026-10-10T14:15:00.000Z').toISOString()
      }
    ];
    this.nextId = 4;
  }

  formatRow(row) {
    if (!row) return null;
    const createdAt = row.created_at ? new Date(row.created_at).toISOString() : (row.createdAt || new Date().toISOString());
    const updatedAt = row.updated_at ? new Date(row.updated_at).toISOString() : (row.updatedAt || new Date().toISOString());
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      author: row.author,
      category: row.category,
      createdAt,
      updatedAt,
      created_at: createdAt,
      updated_at: updatedAt
    };
  }

  // --- CRUD: READ ---

  async getAll(query = {}) {
    try {
      let sql = `
        SELECT id, title, content, author, category, created_at, updated_at
        FROM announcements
        WHERE 1=1
      `;
      const params = [];

      if (query.category) {
        params.push(query.category);
        sql += ` AND LOWER(category) = LOWER($${params.length})`;
      }

      if (query.author) {
        params.push(`%${query.author}%`);
        sql += ` AND author ILIKE $${params.length}`;
      }

      if (query.search) {
        params.push(`%${query.search}%`);
        const idx = params.length;
        sql += ` AND (title ILIKE $${idx} OR content ILIKE $${idx} OR author ILIKE $${idx} OR category ILIKE $${idx})`;
      }

      sql += ` ORDER BY id DESC`;

      const result = await db.query(sql, params);
      return result.rows.map(r => this.formatRow(r));
    } catch (dbErr) {
      // In-memory fallback
      let result = [...this.announcements];

      if (query.category) {
        result = result.filter(a => a.category.toLowerCase() === query.category.toLowerCase());
      }

      if (query.author) {
        result = result.filter(a => a.author.toLowerCase().includes(query.author.toLowerCase()));
      }

      if (query.search) {
        const term = query.search.toLowerCase();
        result = result.filter(a =>
          a.title.toLowerCase().includes(term) ||
          a.content.toLowerCase().includes(term) ||
          a.author.toLowerCase().includes(term) ||
          a.category.toLowerCase().includes(term)
        );
      }

      // Sort descending by id/createdAt
      return result.sort((a, b) => b.id - a.id);
    }
  }

  async getById(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return null;

    try {
      const res = await db.query(
        `SELECT id, title, content, author, category, created_at, updated_at
         FROM announcements WHERE id = $1`,
        [numId]
      );
      if (res.rowCount > 0) {
        return this.formatRow(res.rows[0]);
      }
      return null;
    } catch (dbErr) {
      return this.announcements.find(a => a.id === numId) || null;
    }
  }

  // --- CRUD: CREATE ---

  async create(data) {
    const { title, content, author, category } = data;

    if (!title || !String(title).trim()) {
      const err = new Error('Başlık (title) alanı zorunludur.');
      err.status = 400;
      err.type = 'Validation Error';
      throw err;
    }

    if (!content || !String(content).trim()) {
      const err = new Error('İçerik (content) alanı zorunludur.');
      err.status = 400;
      err.type = 'Validation Error';
      throw err;
    }

    const cleanTitle = String(title).trim();
    const cleanContent = String(content).trim();
    const cleanAuthor = author && String(author).trim() ? String(author).trim() : 'Alumni Administration';
    const cleanCategory = category && String(category).trim() ? String(category).trim() : 'General';

    try {
      const res = await db.query(`
        INSERT INTO announcements (title, content, author, category)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, content, author, category, created_at, updated_at;
      `, [cleanTitle, cleanContent, cleanAuthor, cleanCategory]);

      const created = this.formatRow(res.rows[0]);
      this.announcements.push(created);
      return created;
    } catch (dbErr) {
      if (dbErr.status) throw dbErr;

      // In-memory fallback
      const now = new Date().toISOString();
      const newAnnouncement = {
        id: this.nextId++,
        title: cleanTitle,
        content: cleanContent,
        author: cleanAuthor,
        category: cleanCategory,
        createdAt: now,
        updatedAt: now,
        created_at: now,
        updated_at: now
      };

      this.announcements.push(newAnnouncement);
      return newAnnouncement;
    }
  }

  // --- CRUD: UPDATE ---

  async update(id, data) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      const err = new Error('Geçersiz duyuru ID formatı.');
      err.status = 400;
      throw err;
    }

    const { title, content, author, category } = data;

    if (title !== undefined && !String(title).trim()) {
      const err = new Error('Başlık (title) boş bırakılamaz.');
      err.status = 400;
      err.type = 'Validation Error';
      throw err;
    }

    if (content !== undefined && !String(content).trim()) {
      const err = new Error('İçerik (content) boş bırakılamaz.');
      err.status = 400;
      err.type = 'Validation Error';
      throw err;
    }

    try {
      const existingRes = await db.query(`SELECT * FROM announcements WHERE id = $1`, [numId]);
      if (existingRes.rowCount === 0) {
        const err = new Error(`ID ${numId} olan duyuru bulunamadı.`);
        err.status = 404;
        err.type = 'Not Found';
        throw err;
      }

      const existing = existingRes.rows[0];
      const newTitle = title !== undefined ? String(title).trim() : existing.title;
      const newContent = content !== undefined ? String(content).trim() : existing.content;
      const newAuthor = author !== undefined ? String(author).trim() : existing.author;
      const newCategory = category !== undefined ? String(category).trim() : existing.category;

      const res = await db.query(`
        UPDATE announcements
        SET title = $1, content = $2, author = $3, category = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING id, title, content, author, category, created_at, updated_at;
      `, [newTitle, newContent, newAuthor, newCategory, numId]);

      const updated = this.formatRow(res.rows[0]);
      const idx = this.announcements.findIndex(a => a.id === numId);
      if (idx !== -1) this.announcements[idx] = updated;
      return updated;
    } catch (dbErr) {
      if (dbErr.status) throw dbErr;

      // In-memory fallback
      const index = this.announcements.findIndex(a => a.id === numId);
      if (index === -1) {
        const err = new Error(`ID ${numId} olan duyuru bulunamadı.`);
        err.status = 404;
        err.type = 'Not Found';
        throw err;
      }

      const existing = this.announcements[index];
      const updatedAnnouncement = {
        ...existing,
        title: title !== undefined ? String(title).trim() : existing.title,
        content: content !== undefined ? String(content).trim() : existing.content,
        author: author !== undefined ? String(author).trim() : existing.author,
        category: category !== undefined ? String(category).trim() : existing.category,
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.announcements[index] = updatedAnnouncement;
      return updatedAnnouncement;
    }
  }

  // --- CRUD: DELETE ---

  async delete(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      const err = new Error('Geçersiz duyuru ID formatı.');
      err.status = 400;
      throw err;
    }

    try {
      const res = await db.query(`
        DELETE FROM announcements
        WHERE id = $1
        RETURNING id, title, content, author, category, created_at, updated_at;
      `, [numId]);

      if (res.rowCount === 0) {
        const err = new Error(`ID ${numId} olan duyuru bulunamadı.`);
        err.status = 404;
        err.type = 'Not Found';
        throw err;
      }

      const deleted = this.formatRow(res.rows[0]);
      const idx = this.announcements.findIndex(a => a.id === numId);
      if (idx !== -1) this.announcements.splice(idx, 1);
      return deleted;
    } catch (dbErr) {
      if (dbErr.status) throw dbErr;

      // In-memory fallback
      const index = this.announcements.findIndex(a => a.id === numId);
      if (index === -1) {
        const err = new Error(`ID ${numId} olan duyuru bulunamadı.`);
        err.status = 404;
        err.type = 'Not Found';
        throw err;
      }

      const [deleted] = this.announcements.splice(index, 1);
      return deleted;
    }
  }
}

module.exports = new AnnouncementModel();
