module.exports = {
  name: '005_create_job_postings_table',
  async up(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_postings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(160) NOT NULL,
        company VARCHAR(120) NOT NULL,
        location VARCHAR(100) NOT NULL DEFAULT 'Remote',
        employment_type VARCHAR(30) NOT NULL DEFAULT 'Full-Time' CHECK (employment_type IN ('Full-Time', 'Part-Time', 'Contract', 'Internship', 'Remote')),
        description TEXT NOT NULL,
        requirements TEXT,
        salary_range VARCHAR(80),
        application_url VARCHAR(255),
        posted_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT TRUE,
        deadline DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_job_postings_active ON job_postings(is_active);
      CREATE INDEX IF NOT EXISTS idx_job_postings_employment_type ON job_postings(employment_type);
      CREATE INDEX IF NOT EXISTS idx_job_postings_posted_by ON job_postings(posted_by_user_id);
      CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at DESC);
    `);
  },
  async down(client) {
    await client.query(`DROP TABLE IF EXISTS job_postings CASCADE;`);
  }
};
