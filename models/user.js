'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.UserItem, { as: 'UserItem', foreignKey: 'userId' });
    }
    static ROLE_ADMIN = 'admin';
    static ROLE_MANAGER = 'manager';
    static ROLE_NORMAL = 'normal';
  }
  User.init(
    {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      email: DataTypes.STRING,
      points: DataTypes.INTEGER,
      role: {
        type: DataTypes.ENUM,
        values: [User.ROLE_ADMIN, User.ROLE_MANAGER, User.ROLE_NORMAL],
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
