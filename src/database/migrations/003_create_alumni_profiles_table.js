module.exports = {
  name: '003_create_alumni_profiles_table',
  async up(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS alumni_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        current_company VARCHAR(120),
        current_title VARCHAR(120),
        industry VARCHAR(80),
        city VARCHAR(80),
        country VARCHAR(80) DEFAULT 'Turkey',
        linkedin_url VARCHAR(255),
        github_url VARCHAR(255),
        bio TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
  async down(client) {
    await client.query(`DROP TABLE IF EXISTS alumni_profiles CASCADE;`);
  }
};
