const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    count: users.length,
    data: users,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError(`Aucun Utilisateur trouvé avec l'identifiant : ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const user = await User.create(req.body);

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError(`Aucun Utilisateur trouvé avec l'identifiant : ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError(`Aucun Utilisateur trouvé avec l'identifiant : ${req.params.id}`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
