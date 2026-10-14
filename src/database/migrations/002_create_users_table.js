module.exports = {
  name: '002_create_users_table',
  async up(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(160) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        first_name VARCHAR(80) NOT NULL,
        last_name VARCHAR(80) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'ALUMNI' CHECK (role IN ('STUDENT', 'ALUMNI', 'ADMIN')),
        department_id INT REFERENCES departments(id) ON DELETE SET NULL,
        department_name VARCHAR(120),
        graduation_year INT CHECK (graduation_year BETWEEN 1950 AND 2035),
        is_verified BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_grad_year ON users(graduation_year);
    `);
  },
  async down(client) {
    await client.query(`DROP TABLE IF EXISTS users CASCADE;`);
  }
};
