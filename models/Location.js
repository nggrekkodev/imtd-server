const mongoose = require('mongoose');

const sectors = ['Aéronautique', 'Automobile', 'Ferroviaire', 'Mobilité Douce'];
const types = ['Entreprise', 'Laboratoire', 'Formation', 'Association et Institution'];
const formationTypes = ['Initiale', 'Continue', 'Alternance', 'Apprentissage', 'VAE', 'Autre'];
const formationLevels = ['CAP', 'BTS', 'Bac', 'Bac Pro', 'Licence', 'Master', 'Ingénieur'];

const departments = [
  { name: 'Aisne', code: '02' },
  { name: 'Nord', code: '59' },
  { name: 'Oise', code: '60' },
  { name: 'Pas-de-Calais', code: '62' },
  { name: 'Somme', code: '80' },
];

// Schema of a Location
const locationSchema = new mongoose.Schema({
  // Location Type
  type: {
    type: String,
    enum: {
      values: types,
      message: 'Type de localisation non valide',
    },
  },

  sectors: {
    type: [String],
    validate: {
      message: `Secteurs d'activité non valides`,
      validator: function (elements) {
        if (elements.length === 0) return false;

        for (element of elements) {
          // If sectors does not include the sector
          if (!sectors.includes(element)) {
            return false;
          }
        }
        return true;
      },
    },
  },

  name: {
    type: String,
    required: [true, 'Une localisation doit avoir un nom'],
  },

  shortName: {
    type: String,
    default: '',
  },

  labCode: {
    type: String,
    default: '',
  },

  street: {
    type: String,
    required: [true, 'Une localisation doit avoir une rue'],
  },

  location: {
    type: String,
    default: '',
  },

  postCode: {
    type: String,
    required: [true, 'Une localisation doit avoir un code postal'],
  },

  city: {
    type: String,
    required: [true, 'Une localisation doit avoir une ville'],
  },

  departmentCode: {
    type: String,
  },

  departmentName: {
    type: String,
  },

  phone: {
    type: String,
    default: '',
  },

  website: {
    type: String,
    default: '',
  },

  numbers: {
    type: Number,
    default: 0,
  },

  description: {
    type: String,
    default: '',
  },

  keywords: {
    type: String,
    default: '',
  },

  keywordsRegex: {
    type: String,
    select: false,
  },

  // image: {
  //   type: String,
  //   default: 'image_default.png',
  // },

  logo: {
    type: String,
    default: 'logo_default.png',
  },

  formationLevels: {
    type: [String],
    validate: {
      message: `Niveaux de formation non valides`,
      validator: function (elements) {
        if (elements.length === 0) return false;

        for (element of elements) {
          // If sectors does not include the sector
          if (!formationLevels.includes(element)) {
            return false;
          }
        }
        return true;
      },
    },
  },

  formationTypes: {
    type: [String],
    validate: {
      message: `Types de formation non valides`,
      validator: function (elements) {
        if (elements.length === 0) return false;

        for (element of elements) {
          // If sectors does not include the sector
          if (!formationTypes.includes(element)) {
            return false;
          }
        }
        return true;
      },
    },
  },

  // initiale: {
  //   type: Boolean,
  // },
  // continue: {
  //   type: Boolean,
  // },
  // alternance: {
  //   type: Boolean,
  // },
  // apprentissage: {
  //   type: Boolean,
  // },
  // vae: {
  //   type: Boolean,
  // },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, // this field can not be selected from a query. Used to hide this field
  },

  latitude: {
    type: Number,
    required: [true, 'Une localisation doit avoir une latitude'],
  },
  longitude: {
    type: Number,
    required: [true, 'Une localisation doit avoir une longitude'],
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

/**
 * Schema Indexes
 */
locationSchema.index({ position: '2dsphere' });
locationSchema.index({ name: 1 });
locationSchema.index({ description: 1 });
// locationSchema.index({ name: 'text' /*, type: 'text', description: 'text' */ });

/**
 * Schema Middlewares
 */
locationSchema.pre('save', function (next) {
  // Create GeoJSON field with longitude and latitude
  this.position = {
    type: 'Point',
    coordinates: [this.longitude, this.latitude],
  };

  // Create keywordsRegex field
  this.keywordsRegex = `${this.name} ${this.keywords} ${this.description}`;

  // Add department name and code
  this.departmentCode = this.postCode.slice(0, 2);
  console.log(this.departmentCode);
  department = departments.find((dep) => dep.code === this.departmentCode);
  if (department) {
    this.departmentName = department.name;
  } else {
    this.departmentName = 'Département non indexé !';
  }

  // console.log('keywords', this.keywords);

  next();
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
