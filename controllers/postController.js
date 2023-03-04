const db = require('../models');
let sequelize = db.sequelize;
const { QueryTypes } = require('sequelize');
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
    files.map((file, index) => {
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
        uploadedData[index] = data;
        if (Object.keys(uploadedData).length == files.length) {
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

const fetchIndexPosts = async (req, res, next) => {
  try {
    let posts = [];
    let result = null;
    if (req.user) {
      result = await sequelize.query(
        `
        SELECT p.id as "postId",pi.key, "key", pi.status as "status",pi.id as "id", case when ui.id is null then false else true end as owns_item
        FROM "Posts" p 
        JOIN "PostItems" pi on pi."postId" = p.id
        LEFT JOIN "UserItems" ui ON pi."id" = ui."postItemId" and ui."userId" = :userId
        WHERE p.status = :postStatus
        ORDER BY p.id desc, pi.id`,
        {
          replacements: {
            userId: req.user.id,
            postStatus: Post.PUBLISHED,
          },
          type: QueryTypes.SELECT,
          order: [['pi.id', 'DESC']],
        }
      );
    } else {
      result = await sequelize.query(
        `
        SELECT p.id as "postId",pi.key, "key", pi.status as "status",pi.id as "id", false as owns_item
        FROM "Posts" p 
        JOIN "PostItems" pi on pi."postId" = p.id
        WHERE p.status = :postStatus
        ORDER BY p.id desc, pi.id`,
        {
          replacements: {
            postStatus: Post.PUBLISHED,
          },
          type: QueryTypes.SELECT,
          order: [['pi.id', 'DESC']],
        }
      );
    }
    posts = result.reduce((acc, item) => {
      const post = acc.find((post) => post.id == item.postId);
      if (!post) {
        acc.push({
          id: item.postId,
          postItems: [
            {
              id: item.id,
              key: item.key,
              status: item.status,
              ownsItem: item.owns_item,
            },
          ],
        });
      } else {
        post.postItems.push({
          id: item.id,
          key: item.key,
          status: item.status,
          ownsItem: item.owns_item,
        });
      }

      return acc;
    }, []);
    res.status(200).send({
      status: 'success',
      posts: posts,
    });
  } catch (error) {
    console.log(error);
    return next(new AppError('Error fetching posts', 400));
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
      include: {
        model: PostItem,
        as: 'PostItems',
      },
      order: [
        ['id', 'DESC'],
        ['PostItems', 'id', 'ASC'],
      ],
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

const publishPost = async (req, res, next) => {
  try {
    const { postId } = req.body;

    if (!postId) {
      return next(new AppError('Invalid params sent', 400));
    }

    let result = await sequelize.query(
      'SELECT p.id,p.status FROM "Posts" p JOIN "PostItems" pi on pi."postId" = :postId and pi.status = :locked WHERE p.id = :postId and p.status = :status',
      {
        replacements: {
          postId: postId,
          locked: PostItem.LOCKED,
          status: Post.DRAFT,
        },
        type: QueryTypes.SELECT,
        model: Post,
      }
    );

    if (result[0]) {
      let updatedPost = await Post.findOne({
        where: { id: postId },
        include: { model: PostItem, as: 'PostItems' },
        order: [
          ['id', 'DESC'],
          ['PostItems', 'id', 'ASC'],
        ],
      });
      updatedPost.status = Post.PUBLISHED;
      updatedPost.save();

      res.status(200).send({
        status: 'success',
        post: updatedPost,
      });
    } else {
      return next(new AppError('Post does not exist', 400));
    }
  } catch (error) {
    console.log(error);
    return next(new AppError('Error locking item', 400));
  }
};

const savePostItems = async (userId, uploadedData) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      let post = await Post.build(
        { userId: userId, status: Post.DRAFT },
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
          status: PostItem.UNLOCKED,
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

module.exports = {
  createNewPost,
  fetchUserPosts,
  deletePost,
  publishPost,
  fetchIndexPosts,
};
