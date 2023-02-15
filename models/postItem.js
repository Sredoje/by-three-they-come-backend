module.exports = (sequelize, DataTypes) => {
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
