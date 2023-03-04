const db = require('../models');
let sequelize = db.sequelize;
const AppError = require('../utils/appError');

const UserItem = db.UserItem;
const User = db.User;
const PostItem = db.PostItem;
const Post = db.Post;

const buyPostItem = async (req, res, next) => {
  try {
    const { postItemId } = req.body;

    let postItem = await PostItem.findOne({
      where: { postItemId: postItemId, status: PostItem.LOCKED },
    });

    if (!postItem) {
      return next(new AppError('Post item does not exist', 400));
    }

    let userItem = await UserItem.findOne({
      where: { userId: req.user.id, postItemId: postItemId },
    });

    if (userItem) {
      return next(new AppError('Already bought item', 400));
    }

    let user = await User.findOne({
      where: { userId: req.user.id },
    });

    if (user.points < UserItem.ITEM_COST) {
      return next(new AppError('Not Enough points', 400));
    }

    const result = await sequelize.transaction(async (t) => {
      user.points = user.points - UserItem.ITEM_COST;
      await user.save({ transaction: t });
      let userItem = UserItem.build(
        {
          userId: user.id,
          postItemId: postItem.id,
          postId: postItem.postId,
        },
        { transaction: t }
      );
      await userItem.save({ transaction: t }); // save the post instance to get its id

      return userItem;
    });

    res.status(200).send({
      status: 'success',
      postItem: result,
    });
  } catch (error) {
    console.log(error);
    return next(new AppError('Error while unlocking item', 400));
  }
};

const unlockPostItem = async (req, res, next) => {
  try {
    const { postItemId } = req.body;

    const postItem = await PostItem.findOne({
      where: { id: postItemId },
    });

    if (postItem) {
      const post = await Post.findOne({
        where: { id: postItem.postId, userId: req.user.id, status: Post.DRAFT },
      });
      if (post) {
        postItem.status = PostItem.UNLOCKED;
        postItem.save();
        res.status(200).send({
          status: 'success',
          postItem: postItem,
        });
      } else {
        return next(new AppError('Post does not belong to the user', 400));
      }
    } else {
      return next(new AppError('Post item does not exist', 400));
    }
  } catch (error) {
    console.log(error);
    return next(new AppError('Error while unlocking item', 400));
  }
};

const lockPostItem = async (req, res, next) => {
  try {
    const { postItemId } = req.body;

    if (!postItemId) {
      return next(new AppError('Post does not belong to the user', 400));
    }
    const postItem = await PostItem.findOne({
      where: { id: postItemId },
    });

    if (postItem) {
      const post = await Post.findOne({
        where: { id: postItem.postId, userId: req.user.id },
      });
      if (post) {
        postItem.status = PostItem.LOCKED;
        postItem.save();
        res.status(200).send({
          status: 'success',
          postItem: postItem,
        });
      } else {
        return next(new AppError('Post does not belong to the user', 400));
      }
    } else {
      return next(new AppError('Post item does not exist', 400));
    }
  } catch (error) {
    console.log(error);
    return next(new AppError('Error locking item', 400));
  }
};

module.exports = {
  buyPostItem,
  unlockPostItem,
  lockPostItem,
};
