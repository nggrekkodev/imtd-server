const path = require('path');

const Location = require('../models/Location');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('./../utils/APIFeatures');

const earth_distance = 6365.499; // distance from center of earth

// exports.getLocations = catchAsync(async (req, res, next) => {
//   const locations = await Location.find();

//   res.status(200).json({
//     status: 'success',
//     count: locations.length,
//     data: locations,
//   });
// });

exports.getLocations = catchAsync(async (req, res, next) => {
  if (req.query.type) {
    req.query.type = { in: req.query.type.in.split(',') };
    console.log(req.query.type);
  }

  if (req.query.sector) {
    req.query.sector = { in: req.query.sector.in.split(',') };
    console.log(req.query.sector);
  }

  if (req.query.departmentCode) {
    req.query.departmentCode = { in: req.query.departmentCode.in.split(',') };
    console.log(req.query.sector);
  } else if (req.query.position) {
    const params = req.query.position.split(',');
    const radius = +params[0] / earth_distance || 300;
    const latitude = params[1];
    const longitude = params[2];
    req.query.position = { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } };
  } else {
  }

  if (req.query.keyword) {
    const key = req.query.keyword;
    console.log(key);
    req.query.keyword = undefined;

    // const string = '';
    // const re = new RegExp(`/^${key}/i`);
    // const re = new RegExp(key, 'i').stream();
    // console.log(re);
    req.query.name = { $regex: key, $options: '$i' };
    // req.query = { $text: { $search: key } };
  }

  const features = new APIFeatures(Location.find(), req.query).filter().sort().limitFields().paginate();

  // const docs = await features.query.explain(); response.body : statistics
  const locations = await features.query;

  res.status(200).json({
    status: 'success',
    count: locations.length,
    data: locations,
  });
});

exports.getLocation = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(new AppError(`Aucune Localisation trouvée avec l'identifiant : ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: location,
  });
});

exports.createLocation = catchAsync(async (req, res, next) => {
  const location = await Location.create(req.body);

  res.status(200).json({
    status: 'success',
    data: location,
  });
});

exports.updateLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!location) {
    return next(new AppError(`Aucune Localisation trouvée avec l'identifiant : ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: location,
  });
});

exports.deleteLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findByIdAndDelete(req.params.id);

  if (!location) {
    return next(new AppError(`Aucune Localisation trouvée avec l'identifiant : ${req.params.id}`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.uploadImage = catchAsync(async (req, res, next) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(new AppError(`Aucune Localisation trouvée avec l'identifiant : ${req.params.id}`, 404));
  }

  if (!req.files) {
    return next(new AppError(`Aucun fichier à uploader`, 400));
  }

  const file = req.files.image;
  console.log(file);

  // make sure the file is an image
  if (!file.mimetype.startsWith('image')) {
    return next(new AppError(`File format not valid`, 400));
  }

  // check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new AppError(`File too big : > 1Mb`, 400));
  }

  // Create custom filename
  file.name = `image_${location._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new AppError(`Problem with file upload`, 500));
    }

    // insert filename into DB
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { image: file.name },
      {
        new: true,
      }
    );
    res.status(200).json({
      status: 'success',
      data: location,
    });
  });
});

exports.uploadLogo = catchAsync(async (req, res, next) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(new AppError(`Aucune Localisation trouvée avec l'identifiant : ${req.params.id}`, 404));
  }

  if (!req.files) {
    return next(new AppError(`Aucun fichier à uploader`, 400));
  }

  const file = req.files.logo;
  console.log(file);

  // make sure the file is an image
  if (!file.mimetype.startsWith('image')) {
    return next(new AppError(`File format not valid`, 400));
  }

  // check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new AppError(`File too big : > 1Mb`, 400));
  }

  // Create custom filename
  file.name = `logo_${location._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new AppError(`Problem with file upload`, 500));
    }

    // insert filename into DB
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { image: file.name },
      {
        new: true,
      }
    );
    res.status(200).json({
      status: 'success',
      data: location,
    });
  });
});
