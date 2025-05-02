module.exports = (sequelize, DataTypes) => {
  const Internship = sequelize.define('Internship', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    timestamps: true,
    tableName: 'internships',
  });

  Internship.associate = (models) => {
    Internship.belongsTo(models.Student, {
      foreignKey: 'studentId',
      onDelete: 'CASCADE', // Ensures child rows are deleted when parent is deleted
    });
  };

  return Internship;
};