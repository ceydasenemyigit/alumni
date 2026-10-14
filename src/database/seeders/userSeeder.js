const userFactory = require('../factories/userFactory');
const alumniProfileFactory = require('../factories/alumniProfileFactory');
const userModel = require('../../models/userModel');

const CORE_USERS = [
  {
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@alumni.istanbul.edu.tr',
    role: 'ADMIN',
    department_name: 'Computer Engineering',
    graduation_year: 2020,
    is_verified: true
  },
  {
    first_name: 'Emre',
    last_name: 'Yılmaz',
    email: 'emre.yilmaz@alumni.istanbul.edu.tr',
    role: 'ALUMNI',
    department_name: 'Computer Engineering',
    graduation_year: 2024,
    is_verified: true
  },
  {
    first_name: 'Ayşe',
    last_name: 'Kaya',
    email: 'ayse.kaya@alumni.istanbul.edu.tr',
    role: 'STUDENT',
    department_name: 'Computer Engineering',
    graduation_year: 2025,
    is_verified: true
  }
];

/**
 * Seeds core users + factory-generated users
 */
async function seed(client = null) {
  const factoryUsers = userFactory.createMany(6);
  const allUsers = [...CORE_USERS, ...factoryUsers];

  console.log(`- Seeding ${allUsers.length} users (${CORE_USERS.length} core + ${factoryUsers.length} factory generated)...`);

  if (client) {
    for (const u of allUsers) {
      const res = await client.query(`
        INSERT INTO users (email, first_name, last_name, role, department_name, graduation_year, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
        RETURNING id, role;
      `, [u.email, u.first_name, u.last_name, u.role, u.department_name, u.graduation_year, u.is_verified]);

      const insertedUser = res.rows[0];
      if (insertedUser && insertedUser.role === 'ALUMNI') {
        const profile = alumniProfileFactory.create(insertedUser.id);
        await client.query(`
          INSERT INTO alumni_profiles (user_id, current_company, current_title, industry, city, country, linkedin_url, github_url, bio)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (user_id) DO NOTHING;
        `, [
          profile.user_id,
          profile.current_company,
          profile.current_title,
          profile.industry,
          profile.city,
          profile.country,
          profile.linkedin_url,
          profile.github_url,
          profile.bio
        ]);
      }
    }
  } else {
    // In-memory fallback
    for (const u of allUsers) {
      try {
        userModel.create(u);
      } catch (e) {
        // Ignore duplicate if already exists
      }
    }
  }

  return allUsers;
}

module.exports = { seed, CORE_USERS };
