const AppError = require('../utils/appError');
var nodemailer = require('nodemailer');
const process = require('process');
const db = require('../models');
const User = db.User;
const Transaction = db.Transaction;

// We should move this to webhooks
const processPayment = async (req, res, next) => {
  try {
    const { code, event } = req.body;

    if (req.user) {
      let user = await User.findOne({
        where: { id: req.user.id },
      });
      let transaction = await Transaction.findOne({
        where: { userId: req.user.id, chargeId: code },
      });
      if (transaction) {
        console.log('TRANSACTION ALREADY PROCESSED');
        res.status(200).send({
          status: 'success',
          points: user.points,
        });
      } else {
        let transaction = Transaction.build({
          userId: req.user.id,
          content: JSON.stringify(req.body),
          chargeId: code,
        });

        if (event === 'charge_confirmed') {
          transaction.status = Transaction.STATUS_SUCCESS;
          user.points = user.points + User.BOUGHT_POINTS;
          user.save();
        } else {
          transaction.status = Transaction.STATUS_ERROR;
        }
        transaction.save();

        res.status(200).send({
          status: 'success',
          points: user.points,
        });
      }
    } else {
      // No user, we don't care
      res.status(500).send({
        status: 'failure',
      });
    }
  } catch (error) {
    console.log(error);
    return next(new AppError('Authentication failed', 401));
  }
};

module.exports = {
  processPayment,
};
