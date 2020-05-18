const mongoose = require('mongoose');

const sectors = ['Aéronautique', 'Automobile', 'Ferroviaire', 'Autre'];
const types = ['Entreprise', 'Laboratoire', 'Formation'];
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
    required: [true, 'Une localisation doit avoir un code postal'],
  },
  city: {
    type: String,
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

locationSchema.index({ position: '2dsphere' });
locationSchema.index({ name: 1 });
locationSchema.index({ description: 1 });
// locationSchema.index({ name: 'text' /*, type: 'text', description: 'text' */ });

locationSchema.pre('save', function (next) {
  // Add position field (geojson)
  this.position = {
    type: 'Point',
    coordinates: [this.longitude, this.latitude],
  };

  // Add department name and code
  this.departmentCode = +this.postCode.slice(0, 2);
  console.log(this.departmentCode);
  department = departments.find((dep) => dep.code === this.departmentCode);
  if (department) {
    this.departmentName = department.name;
  } else {
    this.departmentName = 'error';
  }

  next();
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
