module.exports = (sequelize) => {
  let Post = sequelize.define('post', {}, { timestamps: true });
  Post.belongsTo(sequelize.models.user, { as: 'user', foreignKey: 'userId' });

  Post.associate = (models) => {
    Post.hasMany(sequalize.models.postItem, {
      as: 'postItems',
      foreignKey: 'postId',
    });
  };

  return Post;
};
