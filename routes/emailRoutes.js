const express = require('express');
const emailController = require('../controllers/emailController');
const { sendFeedback } = emailController;

const router = express.Router();

router.route('/submit-feedback').post(sendFeedback);
module.exports = router;
