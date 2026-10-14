module.exports = {
  name: '001_create_departments_table',
  async up(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL UNIQUE,
        faculty VARCHAR(120) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
  async down(client) {
    await client.query(`DROP TABLE IF EXISTS departments CASCADE;`);
  }
};
