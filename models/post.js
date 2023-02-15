module.exports = (sequelize, DataTypes) => {
  let Post = sequelize.define(
    'post',
    {
      status: {
        type: DataTypes.ENUM,
        values: ['draft', 'published', 'deleted'],
        allowNull: false,
      },
    },
    { timestamps: true }
  );
  Post.belongsTo(sequelize.models.user, { as: 'user', foreignKey: 'userId' });

  Post.associate = (models) => {
    Post.hasMany(sequalize.models.postItem, {
      as: 'postItems',
      foreignKey: 'postId',
    });
  };

  return Post;
};
