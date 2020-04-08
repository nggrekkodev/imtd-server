const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('./../controllers/authentification');
const {
  getLocations,
  getLocations2,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  uploadLogo,
  uploadImage,
} = require('./../controllers/location');

router.route('/').get(getLocations2).post(protect, restrictTo('admin'), createLocation);
// router.route('/').get(getLocations).post(protect, restrictTo('admin'), createLocation);

router
  .route('/:id')
  .get(getLocation)
  .put(protect, restrictTo('admin'), updateLocation)
  .delete(protect, restrictTo('admin'), deleteLocation);

router.route('/:id/image').put(protect, restrictTo('admin'), uploadImage);
router.route('/:id/logo').put(protect, restrictTo('admin'), uploadLogo);

module.exports = router;
