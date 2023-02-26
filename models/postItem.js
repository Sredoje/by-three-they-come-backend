'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static LOCKED = 'locked';
    static UNLOCKED = 'unlocked';
    static DELETED = 'deleted';
  }
  PostItem.init(
    {
      originalName: DataTypes.STRING,
      mimeType: DataTypes.STRING,
      key: DataTypes.STRING,
      location: DataTypes.STRING,
      postId: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM,
        values: [PostItem.UNLOCKED, PostItem.LOCKED, PostItem.DELETED],
      },
    },
    {
      sequelize,
      modelName: 'PostItem',
    }
  );
  return PostItem;
};
