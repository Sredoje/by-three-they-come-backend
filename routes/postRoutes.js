//importing modules
const express = require('express');
const postController = require('../controllers/postController');
const {
  createNewPost,
  fetchUserPosts,
  deletePost,
  publishPost,
  fetchIndexPosts,
} = postController;
const protect = require('../middlewares/protect');
const protectIfExist = require('../middlewares/protectIfExist');

const router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, '');
  },
});
var multipleUpload = multer({ storage: storage }).any();
//Post for uploading pictures

router.route('/:postId').delete(protect, deletePost);
router.post('/', multipleUpload, protect, createNewPost);
router.post('/index', protectIfExist, fetchIndexPosts);
router.post('/publish', protect, publishPost);
router.get('/user-posts/:userId', protect, fetchUserPosts);

module.exports = router;
