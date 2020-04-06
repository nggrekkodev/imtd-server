const mongoose = require('mongoose');

const sectors = ['Aéronautique', 'Automobile', 'Ferroviaire', 'Autre'];
const types = ['Entreprise', 'Laboratoire', 'Formation'];

// Schema of a Location
const locationSchema = new mongoose.Schema({
  sector: {
    type: [String],
    // required: [true, `Une localisation doit avoir au minimum un secteur d'activité valide : ${sectors}`],
    validate: {
      message: 'Secteur non valide',
      validator: function (val) {
        for (el of val) {
          if (!sectors.includes(el)) {
            return false;
          }
        }
        return true;
      },
    },
  },
  type: {
    type: String,
    // required: [true, 'Une localisation doit avoir un type'],
    enum: {
      values: types,
      message: 'Type non valide',
    },
  },
  name: {
    type: String,
    required: [true, 'Une localisation doit avoir un nom'],
  },
  shortName: {
    type: String,
  },
  labCode: {
    type: String,
  },
  street: {
    type: String,
  },
  location: {
    type: String,
  },
  postCode: {
    type: String,
    // required: [true, 'Une localisation doit avoir un code postal']
  },
  city: {
    type: String,
  },
  phone: {
    type: String,
  },
  website: {
    type: String,
  },
  numbers: {
    type: Number,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
    default: 'image_default.png',
  },
  logo: {
    type: String,
    default: 'logo_default.png',
  },
  formationLevel: {
    type: String,
  },
  initiale: {
    type: Boolean,
  },
  continue: {
    type: Boolean,
  },
  alternance: {
    type: Boolean,
  },
  apprentissage: {
    type: Boolean,
  },
  vae: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, // this field can not be selected from a query. Used to hide this field
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  position: {
    // GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
  },
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
