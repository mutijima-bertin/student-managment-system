const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Initialize Company model first since other models depend on it
db.Company = require('./companies')(sequelize, DataTypes);

// Initialize other models
db.Student = require('./students')(sequelize, DataTypes);
db.User = require('./users')(sequelize, DataTypes);
db.Internship = require('./internships')(sequelize, DataTypes);

// Initialize associations after defining all models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;