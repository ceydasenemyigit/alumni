const announcementFactory = require('../factories/announcementFactory');
const announcementModel = require('../../models/announcementModel');

const CORE_ANNOUNCEMENTS = [
  {
    title: 'Annual Alumni Homecoming 2026',
    content: 'Join us for the annual Istanbul University Alumni Gathering on campus with keynote speakers, networking sessions, and gala dinner.',
    author: 'Alumni Relations Office',
    category: 'Event'
  },
  {
    title: 'Tech Mentorship Program Applications Open',
    content: 'We are pairing recent graduates with experienced alumni in the tech industry. Applications close by the end of this month.',
    author: 'Career Development Center',
    category: 'Career'
  },
  {
    title: 'Campus Library Digital Access for Alumni',
    content: 'All registered alumni now have off-campus digital access to university academic journals and research repositories.',
    author: 'University Library',
    category: 'General'
  }
];

/**
 * Seeds core announcements + factory-generated announcements
 */
async function seed(client = null) {
  const factoryAnnouncements = announcementFactory.createMany(4);
  const allAnnouncements = [...CORE_ANNOUNCEMENTS, ...factoryAnnouncements];

  console.log(`- Seeding ${allAnnouncements.length} announcements (${CORE_ANNOUNCEMENTS.length} core + ${factoryAnnouncements.length} factory generated)...`);

  if (client) {
    for (const a of allAnnouncements) {
      await client.query(`
        INSERT INTO announcements (title, content, author, category)
        VALUES ($1, $2, $3, $4);
      `, [a.title, a.content, a.author, a.category]);
    }
  } else {
    // In-memory fallback
    for (const a of allAnnouncements) {
      try {
        announcementModel.create(a);
      } catch (e) {
        // Ignore duplicate or validation error if any
      }
    }
  }

  return allAnnouncements;
}

module.exports = { seed, CORE_ANNOUNCEMENTS };
