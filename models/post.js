module.exports = (sequelize) => {
  let Post = sequelize.define("post", {}, { timestamps: true });
  Post.belongsTo(sequelize.models.user, { as: "user", foreignKey: "postId" });

  return Post;
};
