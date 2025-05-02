require('dotenv').config();

// Updated the database configuration to include the correct password
const config = {
    development: {
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'database_development',
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
    },
    test: {
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'database_test',
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
    },
    production: {
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'database_production',
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
    },
};

module.exports = config;