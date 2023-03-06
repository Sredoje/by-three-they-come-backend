const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const db = require('../models');

// Assigning users to the variable User
const User = db.User;
//  Protecting Routes
module.exports = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('you are not logged in ', 401));
  }

  // 2- validate the token
  let decode = null;
  try {
    decode = await jwt.verify(token, process.env.SECRET_KEY);
  } catch {
    return next(new AppError('Cannot decode token', 401));
  }

  // 3- check user exits
  //find a user by their email
  const currentUser = await User.findOne({
    where: {
      id: decode.id,
    },
  });
  if (!currentUser) {
    return next(
      new AppError('the user belong to this token does not exists ', 401)
    );
  }

  req.user = currentUser;
  next();
};
