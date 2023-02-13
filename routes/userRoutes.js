//importing modules
const express = require('express');
const userController = require('../controllers/userController');
const { signup, login } = userController;
const userAuth = require('../middlewares/userAuth');

const router = express.Router();

// Signup route
router.post('/signup', userAuth.saveUser, signup);

// login route
router.post('/login', login);

module.exports = router;
