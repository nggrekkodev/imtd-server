const express = require('express');
const router = express.Router();

const { getAllLocations } = require('./../controllers/locationController');

router.route('/').get(getAllLocations);

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
