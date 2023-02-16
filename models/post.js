'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Post.hasMany(models.PostItem, { as: 'PostItems', foreignKey: 'postId' });
    }
  }
  Post.init(
    {
      status: {
        type: DataTypes.ENUM,
        values: ['draft', 'published', 'deleted'],
      },
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Post',
    }
  );
  return Post;
};
