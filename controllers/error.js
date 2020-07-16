const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  // path : name of the field
  // value : field value
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

/*  {
    "status": "error",
    "error": {
        "driver": true,
        "name": "MongoError",
        "index": 0,
        "code": 11000,
        "errmsg": "E11000 duplicate key error collection: natours.tours index: name_1 dup key: { : \"The Forest Hiker\" }",
        "statusCode": 500,
        "status": "error"
    }
}*/
const handleDuplicateFieldsDB = (err) => {
  // extract the name \"The Forest Hiker\"
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  // console.log(value);
  const message = `Duplicate field value : ${value}. Please use another value !`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((element) => element.message);
  const message = `Invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTExpiredError = (err) => {
  const message = `Your token has expired. Please Log in`;
  return new AppError(message, 401);
};

const handleJWTInvalidError = (err) => new AppError('Your token is not valid ! Please log in again', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational error that we trust : send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or other unknown error : don't leak error details
  else {
    // 1) Log error
    // console.error('ERROR 💥', err);
    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong !!! ',
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV.trim() === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    let error = { ...err };

    // HANDLE OPERATIONAL ERRORS
    // Handle Invalid DB IDs
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTInvalidError(error);

    sendErrorProd(error, res);
  }
};
