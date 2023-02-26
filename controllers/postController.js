const db = require('../models');
let sequalize = db.sequelize;
const AppError = require('../utils/appError');
let AWS = require('aws-sdk');
const { randomUUID } = require('crypto');
const { getFileExtension } = require('../utils/utilFunctions');

AWS.config.update({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_ACCESS_SECRET,
  region: process.env.AWS_REGION,
});
// Assigning users to the variable User
const Post = db.Post;
const PostItem = db.PostItem;

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
const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findOne({
      where: { id: postId, userId: req.user.id },
    });
    if (post) {
      await post.destroy();
      res.status(200).send({
        status: 'success',
        post: post,
      });
    } else {
      return next(new AppError('Post already deleted', 400));
    }
  } catch (error) {
    console.log(error);
    return next(new AppError('Error fetching user posts', 400));
  }
};

const savePostItems = async (userId, uploadedData) => {
  try {
    const result = await sequalize.transaction(async (t) => {
      let post = await Post.build(
        { userId: userId, status: 'draft' },
        { transaction: t }
      );
      await post.save({ transaction: t }); // save the post instance to get its id

      const postItems = uploadedData.map(async (item) => {
        let builtItem = {
          postId: post.id,
          originalName: item.originalName,
          mimeType: item.mimeType,
          key: item.key,
          location: item.Location,
          status: 'unlocked',
        };
        const postItem = await PostItem.build(builtItem, { transaction: t });
        return postItem.save({ transaction: t }); // save the post item instance
      });

      await Promise.all(postItems); // wait for all post item instances to be saved

      return post;
    });

    // If the execution reaches this line, the transaction has been committed successfully
    // `result` is whatever was returned from the transaction callback (the `user`, in this case)
    return result;
  } catch (error) {
    console.log(error);
    // If the execution reaches this line, an error occurred.
    // The transaction has already been rolled back automatically by Sequelize!
  }
};
const createNewPost = async (req, res, next) => {
  try {
    if (!req.files) {
      return next(new AppError('Images are not present', 400));
    }

    let files = req.files;
    if (files.length < 3) {
      return next(new AppError('At least 3 images must be uploaded', 400));
    }
    let s3 = new AWS.S3();

    let uploadedData = [];
    files.map((file) => {
      const fileContent = Buffer.from(file.buffer, 'binary');
      const fileExtension = getFileExtension(file.mimetype);
      const key = randomUUID() + '.' + fileExtension;
      const params = {
        Bucket: process.env.AWS_S3_IMAGE_BUCKET,
        Key: key,
        Body: fileContent,
      };
      // Uploading files to the bucket
      s3.upload(params, async function (err, data) {
        if (err) {
          throw err;
        }
        data['originalName'] = file.originalname;
        data['mimeType'] = file.mimetype;
        data['Key'] = key;
        uploadedData.push(data);
        if (uploadedData.length == files.length) {
          await savePostItems(req.user.id, uploadedData);
          res.send({
            response_code: 200,
            response_message: 'Success',
            response_data: uploadedData,
          });
        }
      });
    });
  } catch (error) {
    return next(new AppError('Error uploading images', 400));
  }
};

const fetchUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId == req.user.id) {
      // Fethicng own posts
    } else {
      // Fethicng someone elses posts, add locked ones
    }

    //find a user by their email
    const posts = await Post.findAll({
      where: {
        userId: userId,
      },
      include: { model: PostItem, as: 'PostItems' },
      order: [['id', 'DESC']],
    });
    res.status(200).send({
      status: 'success',
      posts: posts,
    });
  } catch (error) {
    console.log(error);
    return next(new AppError('Error fetching user posts', 400));
  }
};

module.exports = {
  createNewPost,
  fetchUserPosts,
  deletePost,
  lockPostItem,
  unlockPostItem,
};
