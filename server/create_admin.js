const { pool } = require('./db');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createAdmin() {
  const client = await pool.connect();
  try {
    const password = 'admin'; // Setup a simple password
    const hashed = await bcrypt.hash(password, 10);
    const username = 'admin';
    const name = 'Master Vampire (Admin)';
    const role = 'admin';

    // Check if it already exists
    const exists = await client.query('SELECT * FROM users WHERE email = $1', [username]);
    if (exists.rows.length > 0) {
      console.log('Admin account already exists!');
    } else {
      await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        [name, username, hashed, role]
      );
      console.log('Successfully created the Admin account!');
    }
  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    client.release();
    pool.end();
  }
}

createAdmin();
