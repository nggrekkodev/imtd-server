const Location = require('../models/Location');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getLocations = catchAsync(async (req, res, next) => {
  const locations = await Location.find();

  res.status(200).json({
    status: 'success',
    count: locations.length,
    data: locations
  });
});

exports.getLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(new AppError(`Aucune Localisation trouvée avec l'identifiant : ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: location
  });
});

exports.createLocation = catchAsync(async (req, res, next) => {
  const location = await Location.create(req.body);

  res.status(200).json({
    status: 'success',
    data: location
  });
});

exports.updateLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!location) {
    return next(new AppError(`Aucune Localisation trouvée avec l'identifiant : ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: location
  });
});

exports.deleteLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findByIdAndDelete(req.params.id);

  if (!location) {
    return next(new AppError(`Aucune Localisation trouvée avec l'identifiant : ${req.params.id}`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
