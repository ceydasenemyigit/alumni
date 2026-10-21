/**
 * Application Factory
 * Generates valid job application test records with realistic cover letters, URLs, and statuses.
 */

const VALID_STATUSES = ['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'];

const COVER_LETTERS = [
  'I am very enthusiastic about this opportunity and believe my skill set in engineering aligns with your requirements.',
  'Having followed your company projects closely, I am confident in adding immediate value to your platform development.',
  'I would like to apply my academic foundation and project experience to this role and continue growing with your team.',
  'Passionate about solving complex problems at scale and excited about the challenges outlined in this job description.'
];

let appCounter = 0;

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function create(userId = 1, jobId = 1, overrides = {}) {
  appCounter++;
  return {
    user_id: overrides.user_id || userId,
    job_posting_id: overrides.job_posting_id || jobId,
    resume_url: overrides.resume_url || `https://storage.example.com/resumes/applicant_${userId}_cv.pdf`,
    cover_letter: overrides.cover_letter || getRandom(COVER_LETTERS),
    status: overrides.status || 'PENDING',
    applied_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
}

function createMany(pairs = [], overrides = {}) {
  return pairs.map(p => create(p.userId, p.jobId, overrides));
}

module.exports = {
  create,
  createMany,
  VALID_STATUSES
};
