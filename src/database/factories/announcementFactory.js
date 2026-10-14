/**
 * Announcement Factory
 * Generates realistic announcements with valid categories and titles
 */

const CATEGORIES = ['Event', 'Career', 'Academic', 'General'];
const AUTHORS = [
  'Alumni Relations Office',
  'Career Development Center',
  'Engineering Student Society',
  'University Rectorate',
  'Dean of Students Office'
];

const ANNOUNCEMENT_TEMPLATES = [
  {
    category: 'Event',
    title: 'Spring Tech & Innovation Summit 2026',
    content: 'Join leading technology executives and distinguished alumni on campus for panels, demos, and evening networking.'
  },
  {
    category: 'Career',
    title: 'Fintech Industry Hiring Day',
    content: 'Leading payment and banking startups are conducting on-campus and virtual interviews for alumni and graduating seniors.'
  },
  {
    category: 'Academic',
    title: 'Postgraduate Scholarship Opportunities in Europe',
    content: 'Applications are now being accepted for the 2026-2027 Erasmus+ and bilateral graduate exchange fellowships.'
  },
  {
    category: 'General',
    title: 'Alumni Card Digital Access Re-Verification',
    content: 'Please confirm your mailing address and digital credentials in the portal to renew your campus access privileges.'
  }
];

let announceCounter = 0;

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function create(overrides = {}) {
  const template = ANNOUNCEMENT_TEMPLATES[announceCounter % ANNOUNCEMENT_TEMPLATES.length];
  announceCounter++;

  return {
    title: overrides.title || `${template.title} #${announceCounter}`,
    content: overrides.content || template.content,
    author: overrides.author || getRandom(AUTHORS),
    category: overrides.category || template.category,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
}

function createMany(count = 4, overrides = {}) {
  return Array.from({ length: count }, () => create(overrides));
}

module.exports = {
  create,
  createMany,
  CATEGORIES
};
