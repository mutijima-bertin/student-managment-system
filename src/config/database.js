const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'student_internship_db', // Database name
  process.env.DB_USER || 'root', // Database user
  process.env.DB_PASSWORD || '', // Database password
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Disable logging for cleaner output
  }
);

module.exports = { sequelize };