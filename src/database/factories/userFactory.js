/**
 * User Factory
 * Generates realistic users (students, alumni, and admins)
 */

const FIRST_NAMES = ['Ahmet', 'Mehmet', 'Can', 'Burak', 'Emre', 'Zeynep', 'Ayşe', 'Elif', 'Fatma', 'Selin', 'Deniz', 'Ece', 'Oğuz', 'Barış'];
const LAST_NAMES = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan'];
const ROLES = ['ALUMNI', 'STUDENT', 'ADMIN'];
const DEPARTMENTS = ['Computer Engineering', 'Electrical Engineering', 'Industrial Engineering', 'Business Administration', 'Economics'];

let userCounter = 100;

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function create(overrides = {}) {
  userCounter++;
  const firstName = overrides.first_name || getRandom(FIRST_NAMES);
  const lastName = overrides.last_name || getRandom(LAST_NAMES);
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const defaultEmail = `${cleanFirst}.${cleanLast}.${userCounter}@alumni.istanbul.edu.tr`;

  return {
    first_name: firstName,
    last_name: lastName,
    email: overrides.email || defaultEmail,
    role: overrides.role || getRandom(ROLES),
    department_name: overrides.department_name || getRandom(DEPARTMENTS),
    graduation_year: overrides.graduation_year !== undefined ? overrides.graduation_year : (2018 + (userCounter % 8)),
    is_verified: overrides.is_verified !== undefined ? overrides.is_verified : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
}

function createMany(count = 5, overrides = {}) {
  return Array.from({ length: count }, () => create(overrides));
}

module.exports = {
  create,
  createMany
};
