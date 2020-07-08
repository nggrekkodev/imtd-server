const path = require('path');

const Location = require('../models/Location');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('./../utils/APIFeatures');
const { listenerCount } = require('../app');

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

  if (req.query.sectors) {
    req.query.sectors = { in: req.query.sectors.in.split(',') };
    console.log(req.query.sectors);
  }

  if (req.query.departmentName) {
    req.query.departmentName = { in: req.query.departmentName.in.split(',') };
    console.log(req.query.departmentName);
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
    const keyword = req.query.keyword;
    delete req.query.keyword;
    console.log('-> keyword : ', keyword);
    req.query.keywordsRegex = { $regex: keyword, $options: '$i' };

    // const string = '';
    // const re = new RegExp(`/^${key}/i`);
    // const re = new RegExp(key, 'i').stream();
    // console.log(re);
    // req.query.name = { $regex: key, $options: '$i' };
    // req.query.description = { $regex: key, $options: '$i' };
    // req.query = { $text: { $search: key } };
  }

  const features = new APIFeatures(Location.find(), req.query).filter().sort().limitFields().paginate();

  // console.log('Display features query');
  // console.log(features);

  // const docs = await features.query.explain(); response.body : statistics
  const locations = await features.query;
  // console.log(features.query);
  // const locations = await Location.aggregate([
  //   {
  //     $match: {features.query},
  //   },
  // ]);

  res.status(200).json({
    status: 'success',
    count: locations.length,
    data: locations,
  });
});

exports.getLocation = catchAsync(async (req, res, next) => {
  // console.log(req.params.id);
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
  console.log(req.body);
  const location = await Location.create(req.body);

  res.status(200).json({
    status: 'success',
    data: location,
  });
});

exports.updateLocation = catchAsync(async (req, res, next) => {
  // console.log('before ', req.body);
  const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // console.log('after', location);

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
    // data: { message: 'deleted' },
  });
});

exports.getStats = catchAsync(async (req, res, next) => {
  let data = await Location.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
      },
    },
  ]);

  data.forEach((el) => {
    el.type = el._id;
    delete el._id;
  });

  res.status(200).json({
    status: 'success',
    data: data,
  });
});

exports.uploadLogo = catchAsync(async (req, res, next) => {
  console.log('req.params.id', req.params.id);
  // console.log('req.files', req.files);
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(new AppError(`Aucune Localisation trouvée avec l'identifiant : ${req.params.id}`, 404));
  }

  if (!req.files) {
    return next(new AppError(`Aucun fichier à uploader`, 400));
  }

  const file = req.files.logo;
  // console.log('logo', file);

  // make sure the file is an image
  if (!file.mimetype.startsWith('image') && file.mimetype !== 'application/octet-stream') {
    return next(new AppError(`File format not valid`, 400));
  }

  // check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new AppError(`File too big : > 1Mb`, 400));
  }

  // Create custom filename
  if (file.mimetype === 'application/octet-stream') {
    file.name = `logo_${location._id}.png`;
  } else {
    file.name = `logo_${location._id}${path.parse(file.name).ext}`;
  }

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new AppError(`Problem with file upload`, 500));
    }

    // insert filename into DB
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { logo: file.name },
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

/*
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
 */
