const express = require('express');
const paymentsController = require('../controllers/paymentsController');
const { processPayment } = paymentsController;
const protect = require('../middlewares/protect');

const router = express.Router();

router.route('/').post(protect, processPayment);
module.exports = router;
