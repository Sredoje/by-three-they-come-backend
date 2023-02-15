module.exports = (sequelize, DataTypes) => {
  // postId: post.id,
  // originalName: item.originalName,
  // mimeType: item.mimeType,
  // key: item.key,
  // location: item.Location,
  let PostItem = sequelize.define(
    'postItem',
    {
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { timestamps: true }
  );
  PostItem.belongsTo(sequelize.models.post, {
    as: 'post',
    foreignKey: 'postId',
  });

  return PostItem;
};
