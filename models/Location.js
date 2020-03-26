const mongoose = require('mongoose');

const sectors = ['Aéronautique', 'Ferroviaire', 'Automobile'];
const types = ['Entreprise', 'Laboratoire', 'Formation'];

// Schema of a Location
const locationSchema = new mongoose.Schema({
  sector: {
    type: [String],
    // required: [true, `Une localisation doit avoir au minimum un secteur d'activité valide : ${sectors}`],
    validate: {
      message: 'Secteur non valide',
      validator: function(val) {
        for (el of val) {
          if (!sectors.includes(el)) {
            return false;
          }
        }
        return true;
      }
    }
  },
  type: {
    type: String,
    // required: [true, 'Une localisation doit avoir un type'],
    enum: {
      values: types,
      message: 'Type non valide'
    }
  },
  name: {
    type: String,
    required: [true, 'Une localisation doit avoir un nom']
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
    // required: [true, 'Une localisation doit avoir un code postal']
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
    type: String,
    default: 'image_default.png'
  },
  logo: {
    type: String,
    default: 'logo_default.png'
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

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
