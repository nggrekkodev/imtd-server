const express = require('express');
const router = express.Router();

const { getUsers, getUser, createUser, updateUser, deleteUser } = require('./../controllers/user');
const { signup, login, protect, restrictTo } = require('./../controllers/authentification');

router.route('/signup').post(signup);
router.route('/login').post(login);
// router.route('/forgot-password').post(authController.forgotPassword);
// router.route('/reset-password/:token').patch(authController.resetPassword);

// Protect all routes after this middleware
router.use(protect);

// router.route('/update-my-password').patch(authController.updatePassword);
// router.route('/me').get(userController.getMe, userController.getUser);
// router.route('/update-me').patch(userController.updateMe);
// router.route('/delete-me').delete(userController.deleteMe);

// Protect all next routes, only admin can access these routes (+ protect middleware)
router.use(restrictTo('admin'));

router
  .route('/')
  .get(getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
