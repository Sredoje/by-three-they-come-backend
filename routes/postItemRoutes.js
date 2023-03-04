//importing modules
const express = require('express');
const postItemController = require('../controllers/postItemController');
const { lockPostItem, unlockPostItem, buyPostItem } = postItemController;
const protect = require('../middlewares/protect');

const router = express.Router();

router.route('/lock').post(protect, lockPostItem);
router.route('/unlock').post(protect, unlockPostItem);
router.route('/buy').post(protect, buyPostItem);

module.exports = router;
