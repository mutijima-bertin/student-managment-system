module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'full_name' // This maps the 'name' field to 'full_name' in database
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false,
      defaultValue: 'other' // Providing a default value
    }
  });

  Student.associate = (models) => {
    if (models.Internship) {
      Student.hasMany(models.Internship, {
        foreignKey: 'studentId',
      });
    }
  };

  return Student;
};