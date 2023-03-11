const AppError = require('../utils/appError');
var nodemailer = require('nodemailer');
const process = require('process');

const sendFeedback = async (req, res, next) => {
  try {
    const { subject, body, email } = req.body;

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log(process.env.EMAIL_SENDER);
    console.log(process.env.EMAIL_PASSWORD);
    var mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: subject,
      text: body,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return next(new AppError('Authentication failed', 401));
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send({
          status: 'success',
        });
      }
    });
  } catch (error) {
    console.log(error);
    return next(new AppError('Authentication failed', 401));
  }
};

module.exports = {
  sendFeedback,
};
