const departmentFactory = require('../factories/departmentFactory');

/**
 * Seeds departments into PostgreSQL or in-memory
 */
async function seed(client = null) {
  const departments = departmentFactory.DEFAULT_DEPARTMENTS;
  console.log(`- Seeding ${departments.length} departments...`);

  if (client) {
    for (const d of departments) {
      await client.query(`
        INSERT INTO departments (name, faculty)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING;
      `, [d.name, d.faculty]);
    }
  }

  return departments;
}

module.exports = { seed };
