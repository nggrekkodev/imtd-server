const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const axios = require('axios');
const FormData = require('form-data');

const Location = require('./../models/Location');

// Read env variables from the file and save them into node env variables
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

const BACKEND_URL = `http://localhost:3000/api/v1/`;

// Read json file
const locations = JSON.parse(fs.readFileSync(`${__dirname}/data.json`, 'utf-8'));

// Import data into db
const importData = async () => {
  try {
    console.log(`Importing ${locations.length} locations`);
    // Skip validation
    const data = await Location.create(locations, { validateBeforeSave: false });
    console.log('Data successfully loaded');
    return Promise.resolve(data);
  } catch (error) {
    console.log(error);
    return Promise.resolve([]);
  }
};

// upload logos into server
const uploadLogos = async (locations) => {
  try {
    const requests = [];

    locations.forEach((location) => {
      const filePath = path.join(`${__dirname}/logos`, location.logo);
      console.log(filePath);

      requests.push(
        new Promise((resolve, reject) => {
          fs.readFile(filePath, (err, imageData) => {
            if (err) throw err;

            const form = new FormData();
            form.append('logo', imageData);

            axios
              .put(`${BACKEND_URL}locations/${location._id}/logo`, form, {
                headers: form.getHeaders(),
              })
              .then((response) => {
                // console.log('*** -> Response');
                resolve(`OK - ${location.name}`);
              })
              .catch((err) => {
                console.log(location);
                console.log(err.response);
                reject(`ERROR - ${location.name}`);
              });
          });
        })
      );
    });

    Promise.all(requests).then((res) => {
      console.log(res);
      process.exit();
    });

    // Promise.all(requests).then((res) => {
    //   console.log(res);
    //   process.exit();
    // });
  } catch (error) {
    console.log(error);
    // process.exit();
  }
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
      // importData().then((data) => {
      //   process.exit();
      // });
      importData().then((data) => {
        uploadLogos(data);
      });
    } else if (process.argv[2] === '--delete') {
      deleteData();
    } else {
    }
  })
  .catch((err) => console.log(err));
