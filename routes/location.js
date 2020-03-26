const express = require('express');
const router = express.Router();

const {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation
} = require('./../controllers/location');
const { protect, restrictTo } = require('./../controllers/authentification');

router
  .route('/')
  .get(getLocations)
  .get(getLocation)
  .post(protect, restrictTo('admin'), createLocation);

router
  .route('/:id')
  .put(protect, restrictTo('admin'), updateLocation)
  .delete(protect, restrictTo('admin'), deleteLocation);

// router
//   .route('/:id')
//   .get(tourController.getTour)
//   .patch(
//     authController.protect,
//     authController.restrictTo('admin', 'lead-guide'),
//     tourController.updateTour
//   )
//   .delete(
//     authController.protect,
//     authController.restrictTo('admin', 'lead-guide'),
//     tourController.deleteTour
//   );

module.exports = router;
