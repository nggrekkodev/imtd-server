const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Location = require('./../models/Location');

// Read env variables from the file and save them into node env variables
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// Read json file
const locations = JSON.parse(fs.readFileSync(`${__dirname}/data.json`, 'utf-8'));

// Import data into db
const importData = async () => {
  try {
    console.log('Importing data');
    // Skip validation
    await Location.create(locations, { validateBeforeSave: false });
    console.log('Data successfully loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// Delete all data from db
const deleteData = async () => {
  try {
    console.log('Deleting data');
    await Location.deleteMany();
    console.log('Data successfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connected to DB');
    if (process.argv[2] === '--import') {
      importData();
    } else if (process.argv[2] === '--delete') {
      deleteData();
    } else {
    }
  })
  .catch((err) => console.log(err));
