//importing modules
const express = require('express');
const postController = require('../controllers/postController');
const {
  createNewPost,
  fetchUserPosts,
  deletePost,
  publishPost,
  fetchIndexPosts,
  fetchPurchasedPosts,
} = postController;
const protect = require('../middlewares/protect');
const protectIfExist = require('../middlewares/protectIfExist');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, '');
  },
});
var multipleUpload = multer({ storage: storage }).any();
//Post for uploading pictures

router
  .route('/:postId')
  .delete(protect, restrictTo(['admin', 'manager']), deletePost);
router.post(
  '/',
  multipleUpload,
  protect,
  restrictTo(['admin', 'manager']),
  createNewPost
);
router.post('/index', protectIfExist, fetchIndexPosts);
router.post('/publish', protect, publishPost);
router.get('/user-posts/:userId', protect, fetchUserPosts);
router.get('/purchased/:userId', protect, fetchPurchasedPosts);

module.exports = router;
