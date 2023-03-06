const AppError = require('../utils/appError');

// apply restricting to specific members
module.exports = (role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new AppError(' you do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
