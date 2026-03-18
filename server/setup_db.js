const { Client } = require('pg');
const fs = require('fs');

async function setup() {
  const defaultClient = new Client({
    user: 'postgres',
    host: 'localhost',
    password: 'postgres', // commonly default
    database: 'postgres',
    port: 5432,
  });

  try {
    await defaultClient.connect();
    console.log("Connected to PostgreSQL as 'postgres'.");
    
    const res = await defaultClient.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = 'hotel_management'`);
    if (res.rowCount === 0) {
      console.log("Creating 'hotel_management' database...");
      await defaultClient.query("CREATE DATABASE hotel_management");
      console.log("Database created successfully!");
    } else {
      console.log("Database 'hotel_management' already exists.");
    }
  } catch (err) {
    console.error("Failed to connect or create database:", err.message);
    if (err.message.includes("password authentication failed")) {
      console.log("Please check your PostgreSQL password. The default 'postgres' was used.");
    }
  } finally {
    await defaultClient.end();
  }

  // Then rely on the existing db.js init routine which builds tables
  try {
    const db = require('./db.js');
    await db.initDB();
    console.log("Tables inserted successfully!");
  } catch (err) {
    console.error("Failed to insert tables:", err);
  }
  
  process.exit(0);
}

setup();
