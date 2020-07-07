const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('./../controllers/authentification');
const {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  uploadLogo,
  getStats,
} = require('./../controllers/location');

// TO REMOVE ON PROD
router.route('/:id/logo').put(uploadLogo);

router.route('/').get(getLocations).post(protect, restrictTo('admin'), createLocation);
router.route('/stats').get(getStats);

router
  .route('/:id')
  .get(getLocation)
  .put(protect, restrictTo('admin'), updateLocation)
  .delete(protect, restrictTo('admin'), deleteLocation);

// router.route('/:id/logo').put(protect, restrictTo('admin'), uploadLogo);

// router.route('/:id/image').put(protect, restrictTo('admin'), uploadImage);

module.exports = router;
