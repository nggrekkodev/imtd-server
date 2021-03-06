const express = require('express');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const fileupload = require('express-fileupload');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const morgan = require('morgan');
const chalk = require('chalk');

// Import routers
const locationRouter = require('./routes/location');
const userRouter = require('./routes/user');
const mailerRouter = require('./routes/mailer');

// Import Custom Error and global error handler
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/error');

const app = express();

// Setup template engine
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

// File uploading
app.use(fileupload());

// Set public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set Security HTTP Headers
app.use(helmet());

// CORS
app.use(cors());

console.log(chalk.blue(`Environment mode : ${process.env.NODE_ENV}`));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiter : Limit each IP to 1000 requests per windowMs
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour !',
});

// affect the limiter to all routes starting with '/api'
app.use('/api', limiter);

// Read data from body into req.body. Limit size of body to 1000 kb
app.use(express.json({ limit: '1000kb' }));

// Data sanitization against NOSQL query injection
app.use(mongoSanitize());

// // Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: ['name', 'type[in]', 'sectors[in]', 'departmentCode[in]', 'position', 'departmentName[in]','keyword']
//   })
// );

// Route middlewares
app.use('/api/v1/locations', locationRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/mailer', mailerRouter);

// 404 Route
app.all('*', (req, res, next) => {
  next(new AppError(`Erreur 404 Page introuvable`, 404));
});

/**
 * ERROR HANDLING MIDDLEWARE (4 arguments)
 * When next() receives 4 arguments, triggers this middleware
 */
app.use(globalErrorHandler);

// Export the application configuration
module.exports = app;
