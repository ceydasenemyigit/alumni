/**
 * Alumni Profile Factory
 * Generates career and biographical details for alumni
 */

const COMPANIES = ['Google', 'Microsoft', 'Trendyol', 'Getir', 'Aselsan', 'Havelsan', 'Amazon', 'Siemens', 'Beko'];
const TITLES = ['Senior Software Engineer', 'Full Stack Developer', 'Data Scientist', 'Product Manager', 'DevOps Architect', 'Engineering Lead'];
const INDUSTRIES = ['Information Technology', 'Telecommunications', 'Defense Industry', 'E-Commerce', 'Fintech'];
const CITIES = ['Istanbul', 'Ankara', 'Izmir', 'Berlin', 'London', 'Amsterdam'];

let profileCounter = 1;

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function create(userId, overrides = {}) {
  profileCounter++;
  const company = overrides.current_company || getRandom(COMPANIES);
  const title = overrides.current_title || getRandom(TITLES);
  const city = overrides.city || getRandom(CITIES);

  return {
    user_id: userId,
    current_company: company,
    current_title: title,
    industry: overrides.industry || getRandom(INDUSTRIES),
    city: city,
    country: overrides.country || (['Berlin', 'London', 'Amsterdam'].includes(city) ? 'Germany' : 'Turkey'),
    linkedin_url: overrides.linkedin_url || `https://linkedin.com/in/alumni-user-${userId || profileCounter}`,
    github_url: overrides.github_url || `https://github.com/alumni-user-${userId || profileCounter}`,
    bio: overrides.bio || `Passionate ${title} working at ${company}. Graduated from Istanbul University.`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
}

module.exports = {
  create
};
