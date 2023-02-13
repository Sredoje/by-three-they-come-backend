//importing modules
const bcrypt = require('bcrypt');
const db = require('../models');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
let AWS = require('aws-sdk');
const { randomUUID } = require('crypto');

AWS.config.update({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_ACCESS_SECRET,
  region: process.env.AWS_REGION,
});
// Assigning users to the variable User
const User = db.users;

const createNewPost = async (req, res, next) => {
  try {
    // Handle errors
    // Create post in db and populate urls of image
    // const imagePath = req.files[0].path;
    // console.log(req.files);
    if (!req.files) {
      res.send('Images are not present');
      return;
    }

    let files = req.files;
    if (files.length < 3) {
      res.send('3 images must be uploaded');
      return;
    }
    let s3 = new AWS.S3();

    let uploadedData = [];
    files.map((file) => {
      const fileContent = Buffer.from(file.buffer, 'binary');
      const params = {
        Bucket: process.env.AWS_S3_IMAGE_BUCKET,
        Key: randomUUID(), // Should we only accept jpeg and jpg and png ?
        Body: fileContent,
      };
      // Uploading files to the bucket
      s3.upload(params, function (err, data) {
        if (err) {
          throw err;
        }
        uploadedData.push(data);
        if (uploadedData.length == files.length) {
          res.send({
            response_code: 200,
            response_message: 'Success',
            response_data: uploadedData,
          });
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createNewPost,
};
