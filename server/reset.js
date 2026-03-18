const { pool } = require('./db');
require('dotenv').config();

async function reset() {
  const client = await pool.connect();
  try {
    console.log("Dropping old simple tables...");
    await client.query(`
      DROP TABLE IF EXISTS service_orders CASCADE;
      DROP TABLE IF EXISTS services CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS guests CASCADE;
      DROP TABLE IF EXISTS reservations CASCADE;
      DROP TABLE IF EXISTS rooms CASCADE;
      DROP TABLE IF EXISTS room_categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log("Old tables dropped! Now db.js will create the new ones on startup.");
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

reset();
