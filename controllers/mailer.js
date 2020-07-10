const path = require('path');
const nodemailer = require('nodemailer');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.sendMail = catchAsync(async (req, res, next) => {
  console.log(req.body);
  /**
   * - title
   * - content
   * - email
   * - phone
   */

  // If fields are not valid
  if (!req.body.title || !req.body.content || !req.body.email || !req.body.phone) {
    return next(new AppError(`Les champs ne sont pas valides`, 404));
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: `${process.env.MAILER_LOGIN}`,
      pass: `${process.env.MAILER_PASSWORD}`,
    },
  });

  const mailOptions = {
    from: `${process.env.MAILER_LOGIN}`,
    to: `${process.env.MAILER_HANDLER}`,
    subject: `${req.body.title}`,
    text: `${req.body.content}\nAdresse mail : ${req.body.email}\nTéléphone : ${req.body.phone}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return next(new AppError(`Erreur durant l'envoi de l'email`, 404));
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({
        status: 'success',
        data: 'Success',
      });
    }
  });
});
