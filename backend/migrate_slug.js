const { pool } = require('./config/db');
const { generateSlug } = require('./utils/fileHelper');

async function migrateSlugs() {
  try {
    const [rows] = await pool.query('SELECT id, name FROM team_members WHERE slug IS NULL');
    for (const row of rows) {
      let baseSlug = generateSlug(row.name);
      let finalSlug = baseSlug;
      let isUnique = false;
      let counter = 1;

      while (!isUnique) {
        const [existing] = await pool.query('SELECT id FROM team_members WHERE slug = ? AND id != ?', [finalSlug, row.id]);
        if (existing.length === 0) {
          isUnique = true;
        } else {
          finalSlug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      await pool.query('UPDATE team_members SET slug = ? WHERE id = ?', [finalSlug, row.id]);
      console.log(`Updated ID ${row.id} with slug ${finalSlug}`);
    }
    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrateSlugs();
