/**
 * Department Factory
 * Generates realistic academic departments & faculties
 */

const DEFAULT_DEPARTMENTS = [
  { name: 'Computer Engineering', faculty: 'Faculty of Engineering' },
  { name: 'Electrical & Electronics Engineering', faculty: 'Faculty of Engineering' },
  { name: 'Industrial Engineering', faculty: 'Faculty of Engineering' },
  { name: 'Civil Engineering', faculty: 'Faculty of Engineering' },
  { name: 'Mechanical Engineering', faculty: 'Faculty of Engineering' },
  { name: 'Business Administration', faculty: 'Faculty of Economics and Administrative Sciences' },
  { name: 'Economics', faculty: 'Faculty of Economics and Administrative Sciences' },
  { name: 'Law', faculty: 'Faculty of Law' },
  { name: 'Medicine', faculty: 'Faculty of Medicine' }
];

let deptCounter = 0;

function create(overrides = {}) {
  const template = DEFAULT_DEPARTMENTS[deptCounter % DEFAULT_DEPARTMENTS.length];
  deptCounter++;

  return {
    name: overrides.name || (deptCounter > DEFAULT_DEPARTMENTS.length ? `${template.name} ${deptCounter}` : template.name),
    faculty: overrides.faculty || template.faculty,
    ...overrides
  };
}

function createMany(count = 3, overrides = {}) {
  return Array.from({ length: count }, () => create(overrides));
}

module.exports = {
  create,
  createMany,
  DEFAULT_DEPARTMENTS
};
