const express = require('express');
const router = express.Router();
const { sendMail } = require('./../controllers/mailer');

// Routes
router.route('/').post(sendMail);

module.exports = router;
