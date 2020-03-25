const Location = require('./../models/Location');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

exports.getAllLocations = catchAsync(async (req, res, next) => {
  res.status(200).json({ success: true });
});
