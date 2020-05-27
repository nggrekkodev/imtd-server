const mongoose = require('mongoose');

const sectors = ['Aéronautique', 'Automobile', 'Ferroviaire', 'Mobilité Douce'];
const types = ['Entreprise', 'Laboratoire', 'Formation', 'Association et Institution'];
const departments = [
  {
    name: 'Aisne',
    code: 02,
  },
  {
    name: 'Nord',
    code: 59,
  },
  {
    name: 'Oise',
    code: 60,
  },
  {
    name: 'Pas-de-Calais',
    code: 62,
  },
  {
    name: 'Somme',
    code: 80,
  },
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
    // required: [true, `Une localisation doit avoir au minimum un secteur d'activité valide : ${sectors}`],
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
  },

  labCode: {
    type: String,
  },

  street: {
    type: String,
    required: [true, 'Une localisation doit avoir une rue'],
  },

  location: {
    type: String,
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
    type: Number,
  },

  departmentName: {
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

  keywords: {
    type: String,
  },

  // image: {
  //   type: String,
  //   default: 'image_default.png',
  // },

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

  // Create keywords fields
  this.keywords = `${this.name} ${this.keywords} ${this.description}`;

  // Add department name and code
  this.departmentCode = +this.postCode.slice(0, 2);
  console.log(this.departmentCode);
  department = departments.find((dep) => dep.code === this.departmentCode);
  if (department) {
    this.departmentName = department.name;
  } else {
    this.departmentName = 'error';
  }

  console.log('keywords', this.keywords);

  next();
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
