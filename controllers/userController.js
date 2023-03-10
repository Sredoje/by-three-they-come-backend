//importing modules
const bcrypt = require('bcrypt');
const db = require('../models');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

// Assigning users to the variable User
const User = db.User;

const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const data = {
      username,
      email,
      password: await bcrypt.hash(password, 10),
      points: User.STARTING_POINTS,
      role: User.ROLE_NORMAL,
    };
    const user = await User.create(data);

    //if user details is captured
    //generate token with the user's id and the secretKey in the env file
    // set cookie with the token generated
    if (user) {
      let token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: 1 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        status: 'success',
        user: user,
        token: token,
      });
    } else {
      return next(new AppError('Incorrect details', 400));
    }
  } catch (error) {
    return next(new AppError('Error creating user', 401));
  }
};
// //
// const logout = async (req, res, next) => {
//   console.log(res.cookie);
// };
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //find a user by their email
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    //if user email is found, compare password with bcrypt
    if (user) {
      const isSame = await bcrypt.compare(password, user.password);

      if (isSame) {
        let token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
          expiresIn: 1 * 24 * 60 * 60 * 1000,
        });

        // GENERATE JWT COOKIE
        res.cookie('jwt', token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
        console.log('user', JSON.stringify(user, null, 2));
        res.status(200).json({
          status: 'success',
          user: user,
          token: token,
        });
      } else {
        return next(new AppError('Authentication failed', 401));
      }
    } else {
      return next(new AppError('Authentication failed', 401));
    }
  } catch (error) {
    return next(new AppError('Authentication failed', 401));
  }
};

module.exports = {
  signup,
  login,
};
