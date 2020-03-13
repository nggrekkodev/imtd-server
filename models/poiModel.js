const mongoose = require('mongoose');

// Point Of Interest
const poiSchema = new mongoose.Schema({
  sector: {
    type: String
  },
  name: {
    type: String
  },
  shortName: {
    type: String
  },
  labCode: {
    type: String
  },
  street: {
    type: String
  },
  location: {
    type: String
  },
  postCode: {
    type: Number
  },
  city: {
    type: String
  },
  phone: {
    type: String
  },
  website: {
    type: String
  },
  numbers: {
    type: Number
  },
  description: {
    type: String
  },
  image: {
    type: String
  },
  logo: {
    type: String
  },
  formationLevel: {
    type: String
  },
  initiale: {
    type: String
  },
  continue: {
    type: String
  },
  alternance: {
    type: String
  },
  apprentissage: {
    type: String
  },
  vae: {
    type: String
  }
});

const PointOfInterest = mongoose.model('PointOfInterest', poiSchema);

module.exports = PointOfInterest;
