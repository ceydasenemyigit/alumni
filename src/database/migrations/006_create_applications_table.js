module.exports = {
  name: '006_create_applications_table',
  async up(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_posting_id INT NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
        resume_url VARCHAR(255),
        cover_letter TEXT,
        status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_applications_user_job UNIQUE (user_id, job_posting_id)
      );

      CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
      CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_posting_id);
      CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_user_job ON applications(user_id, job_posting_id);
    `);
  },
  async down(client) {
    await client.query(`DROP TABLE IF EXISTS applications CASCADE;`);
  }
};
