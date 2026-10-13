/**
 * Announcement Model (In-Memory without database connection)
 * Provides full CRUD helper functions and initial seed data.
 */

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

  // --- CRUD: READ ---

  getAll(query = {}) {
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

  getById(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return null;
    return this.announcements.find(a => a.id === numId) || null;
  }

  // --- CRUD: CREATE ---

  create(data) {
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

    const now = new Date().toISOString();
    const newAnnouncement = {
      id: this.nextId++,
      title: String(title).trim(),
      content: String(content).trim(),
      author: author && String(author).trim() ? String(author).trim() : 'Alumni Administration',
      category: category && String(category).trim() ? String(category).trim() : 'General',
      createdAt: now,
      updatedAt: now
    };

    this.announcements.push(newAnnouncement);
    return newAnnouncement;
  }

  // --- CRUD: UPDATE ---

  update(id, data) {
    const numId = parseInt(id, 10);
    const index = this.announcements.findIndex(a => a.id === numId);
    if (index === -1) {
      const err = new Error(`ID ${numId} olan duyuru bulunamadı.`);
      err.status = 404;
      err.type = 'Not Found';
      throw err;
    }

    const existing = this.announcements[index];
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

    const updatedAnnouncement = {
      ...existing,
      title: title !== undefined ? String(title).trim() : existing.title,
      content: content !== undefined ? String(content).trim() : existing.content,
      author: author !== undefined ? String(author).trim() : existing.author,
      category: category !== undefined ? String(category).trim() : existing.category,
      updatedAt: new Date().toISOString()
    };

    this.announcements[index] = updatedAnnouncement;
    return updatedAnnouncement;
  }

  // --- CRUD: DELETE ---

  delete(id) {
    const numId = parseInt(id, 10);
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

module.exports = new AnnouncementModel();
