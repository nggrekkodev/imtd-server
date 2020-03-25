const express = require('express');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const morgan = require('morgan');
const chalk = require('chalk');

// Import routers
const locationRouter = require('./routes/location');
// const tourRouter = require('./routes/tourRoutes');
// const userRouter = require('./routes/userRoutes');
// const reviewRouter = require('./routes/reviewRoutes');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// Setup template engine
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

// Set public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set Security HTTP Headers
app.use(helmet());

console.log(chalk.blue(`Environment mode : ${process.env.NODE_ENV}`));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiter : Allow 100 requests from the same IP in 1 hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour !'
});

// affect the limiter to all routes starting with '/api'
app.use('/api', limiter);

// Read data from body into req.body. Limit size of body to 10 kb
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NOSQL query injection
app.use(mongoSanitize());

// // Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
//   })
// );

// app.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The forest Hiker',
//     user: 'Nick'
//   });
// });

// app.get('/overview', (req, res) => {
//   res.status(200).render('overview', {
//     title: 'All tours'
//   });
// });

// app.get('/tour', (req, res) => {
//   res.status(200).render('tour', {
//     title: 'The Forest Hiker Tour'
//   });
// });

// Route middlewares
app.use('/api/v1/locations', locationRouter);
// app.use('/api/v1/tours', tourRouter);
// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/reviews', reviewRouter);

// 404 Route
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server !`, 404));
});

// ERROR HANDLING MIDDLEWARE (4 arguments)
app.use(globalErrorHandler);

// Export the application configuration
module.exports = app;
