//user model
module.exports = (sequelize, DataTypes) => {
  let User = sequelize.define(
    "user",
    {
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        isEmail: true, //checks for email format
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { timestamps: true }
  );

  User.associate = (models) => {
    User.hasMany(sequelize.models.post, { as: "posts", foreignKey: "postId" });
  };

  return User;
};
