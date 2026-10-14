module.exports = {
  name: '004_create_announcements_table',
  async up(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) NOT NULL DEFAULT 'Alumni Administration',
        category VARCHAR(50) NOT NULL DEFAULT 'General' CHECK (category IN ('Event', 'Career', 'Academic', 'General')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
      CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
    `);
  },
  async down(client) {
    await client.query(`DROP TABLE IF EXISTS announcements CASCADE;`);
  }
};
