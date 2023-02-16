//importing modules
const express = require('express');
const postController = require('../controllers/postController');
const { createNewPost, fetchUserPosts } = postController;
const protect = require('../middlewares/protect');

const router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, '');
  },
});
var multipleUpload = multer({ storage: storage }).any();
//Post for uploading pictures
router.post('/create-new-post', multipleUpload, protect, createNewPost);
router.get('/user-posts/:userId', protect, fetchUserPosts);

module.exports = router;
