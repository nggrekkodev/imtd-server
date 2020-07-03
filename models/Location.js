const mongoose = require('mongoose');

// TYPES
const TYPE_ENTREPRISE = 'Entreprise';
const TYPE_LABORATOIRE = 'Laboratoire';
const TYPE_FORMATION = 'Formation';
const TYPE_ASSOCIATION_INSTITUTION = 'Association et Institution';
const types = [TYPE_ENTREPRISE, TYPE_LABORATOIRE, TYPE_FORMATION, TYPE_ASSOCIATION_INSTITUTION];

// SECTORS
const SECTOR_AERONAUTIQUE = 'Aéronautique';
const SECTOR_AUTOMOBILE = 'Automobile';
const SECTOR_FERROVIAIRE = 'Ferroviaire';
const SECTOR_MOBILITE_DOUCE = 'Mobilité Douce';
const sectors = [SECTOR_AERONAUTIQUE, SECTOR_AUTOMOBILE, SECTOR_FERROVIAIRE, SECTOR_MOBILITE_DOUCE];
// const sectors = ['Aéronautique', 'Automobile', 'Ferroviaire', 'Mobilité Douce'];

// FORMATION TYPES
const FORMATION_TYPES_INITIALE = 'Initiale';
const FORMATION_TYPES_CONTINUE = 'Continue';
const FORMATION_TYPES_ALTERNANCE = 'Alternance';
const FORMATION_TYPES_APPRENTISSAGE = 'Apprentissage';
const FORMATION_TYPES_VAE = 'VAE';
const FORMATION_TYPES_AUTRE = 'Autre';
const FORMATION_TYPES_NON_DEFINI = '-';
const formationTypes = [
  FORMATION_TYPES_INITIALE,
  FORMATION_TYPES_CONTINUE,
  FORMATION_TYPES_ALTERNANCE,
  FORMATION_TYPES_APPRENTISSAGE,
  FORMATION_TYPES_VAE,
  FORMATION_TYPES_AUTRE,
  FORMATION_TYPES_NON_DEFINI,
];

// FORMATION LEVELS
const FORMATION_LEVELS_CAP = 'CAP';
const FORMATION_LEVELS_BTS = 'BTS';
const FORMATION_LEVELS_BAC = 'Bac';
const FORMATION_LEVELS_BAC_PRO = 'Bac Pro';
const FORMATION_LEVELS_LICENCE = 'Licence';
const FORMATION_LEVELS_MASTER = 'Master';
const FORMATION_LEVELS_INGENIEUR = 'Ingénieur';
const FORMATION_LEVELS_AUTRE = 'Autre';
const FORMATION_LEVELS_NON_DEFINI = '-';
const formationLevels = [
  FORMATION_LEVELS_CAP,
  FORMATION_LEVELS_BTS,
  FORMATION_LEVELS_BAC,
  FORMATION_LEVELS_BAC_PRO,
  FORMATION_LEVELS_LICENCE,
  FORMATION_LEVELS_MASTER,
  FORMATION_LEVELS_INGENIEUR,
  FORMATION_LEVELS_AUTRE,
  FORMATION_LEVELS_NON_DEFINI,
];

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

  logo: {
    type: String,
    default: 'logo_default.png',
  },

  formationLevels: {
    type: [String],
    required: function () {
      console.log(this.type === TYPE_FORMATION);
      return this.type === TYPE_FORMATION;
    },
    validate: {
      message: `Niveaux de formation non valides`,
      validator: function (elements) {
        if (this.type !== TYPE_FORMATION) {
          console.log('formationLevels skip');
          return true;
        }

        console.log(elements);

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
    required: function () {
      console.log(this.type === TYPE_FORMATION);
      return this.type === TYPE_FORMATION;
    },
    validate: {
      message: `Types de formation non valides`,
      validator: function (elements) {
        console.log(elements);

        if (this.type !== TYPE_FORMATION) {
          console.log('formationTypes skip');
          return true;
        }
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
