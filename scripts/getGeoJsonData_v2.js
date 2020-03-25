const fs = require('fs');
const axios = require('axios');
const XLSX = require('xlsx');

const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Read env variables from the file and save them into node env variables
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

const sheetsJson = {}; // each property is a sheet
const fileName = 'data_v2.xlsx';
const fileOutput = 'data_v2_results.xlsx';
let workbook;

const frenchGovApi = 'https://api-adresse.data.gouv.fr/search/';
const requests = [];
const ipWithCoordinates = [];
const ipWithoutCoordinates = [];
const latitudeMin = 48.830042;
const latitudeMax = 51.089338;
const longitudeMax = 4.25398;
const longitudeMin = 1.378651;

// Construct the query for the API
const getQuery = (ip, version) => {
  let query = `${ip.street} ${ip.city} ${ip.postCode}`;

  if (version === 1) {
    if (ip.type === 'Entreprise') {
      query = `${ip.street} ${ip.city} ${ip.postCode}`;
    } else if (ip.type === 'Laboratoire') {
      query = `${ip.street} ${ip.city} ${ip.name}`;
    } else if (ip.type === 'Formation') {
      query = `${ip.street} ${ip.city} ${ip.name}`;
    }
  } else if (version === 2) {
  }

  return query;
};

// Get coordinates of an interest point (ip)
const getCoordinatesFromFrenchGovApi = async (ip, version) => {
  const querySearch = getQuery(ip, version);

  let res;
  try {
    res = await axios.get(frenchGovApi, {
      params: { q: `${querySearch}`, limit: 1 /*postcode: ip.postCode */ }
    });
  } catch (error) {
    console.log(error);
  }

  // If the request gets a valid result
  if (
    res &&
    res.data.features.length > 0 &&
    res.data.features[0].geometry.coordinates[1] > latitudeMin &&
    res.data.features[0].geometry.coordinates[1] < latitudeMax &&
    res.data.features[0].geometry.coordinates[0] > longitudeMin &&
    res.data.features[0].geometry.coordinates[0] < longitudeMax
  ) {
    // ip['coordinates'] = res.data.features[0].geometry.coordinates;
    ip['latitude'] = res.data.features[0].geometry.coordinates[1];
    ip['longitude'] = res.data.features[0].geometry.coordinates[0];

    // Add the valid interest point to array of ip's with coordinates
    ipWithCoordinates.push(ip);
    console.log(`${ip.name} got coordinates : [${ip.latitude}:${ip.longitude}]`);
  }
  // Request without a valid result
  else {
    console.log(`---> GPS coordinates not found for ${ip.name}, retry with name`);
    // Add the invalid interest point to array of ip's without coordinates
    ipWithoutCoordinates.push(ip);
  }
  return true;
};

const writeFiles = () => {
  try {
    // Write valid results to data.json
    const results = JSON.stringify(ipWithCoordinates);
    fs.writeFileSync(`${__dirname}/data.json`, results);
    console.log(`---> Valid results written in ${__dirname}/data.json`);

    // Write invalid results to dataIncomplete.json
    if (ipWithoutCoordinates.length > 0) {
      const errors = JSON.stringify(ipWithoutCoordinates);
      fs.writeFileSync(`${__dirname}/dataIncomplete.json`, errors);
      console.log(`---> Invalid results written in ${__dirname}/dataIncomplete.json`);
    }

    // Convert each json sheet to a json array and add it has a property of sheetsJson
    for (const property in workbook.Sheets) {
      workbook.Sheets[property] = XLSX.utils.json_to_sheet(sheetsJson[property]);
    }
    // Write workbook data to a new xlsx file
    XLSX.writeFile(workbook, `${__dirname}/${fileOutput}`);
    console.log(`---> New excel file created : ${__dirname}/${fileOutput}`);
  } catch (error) {
    console.log(error);
  }
};

// READ and CONVERT excel to json
try {
  workbook = XLSX.readFile(`${__dirname}/${fileName}`, { raw: true }); // excel workbook

  // Convert each workbook sheet to a json array and add it has a property of sheetsJson
  for (const property in workbook.Sheets) {
    const sheetJson = XLSX.utils.sheet_to_json(workbook.Sheets[property]);
    sheetsJson[property] = sheetJson;
    // sheetJson.forEach(el => console.log(el.latitude + ' ' + el.longitude));
  }
} catch (err) {
  console.log(err);
}

// For each interest point
for (const property in sheetsJson) {
  sheetsJson[property].forEach(ip => {
    const typeLowerCase = property.toLowerCase();
    const type = typeLowerCase.charAt(0).toUpperCase() + typeLowerCase.slice(0, -1).slice(1);
    console.log(type);
    ip['type'] = type;

    // If ip has no coordinates, push the promise to a promise array
    if (!ip.hasOwnProperty('latitude') || !ip.hasOwnProperty('longitude')) {
      requests.push(getCoordinatesFromFrenchGovApi(ip, 1));
    }
    // Else, form the coordinates with latitude and longitude from excel data
    else {
      // parse string to number with + operator
      ip['longitude'] = +ip['longitude'];
      ip['latitude'] = +ip['latitude'];
      // ip['coordinates'] = [ip['longitude'], ip['latitude']];
      ipWithCoordinates.push(ip);
    }
  });
}

// const connection = mongoose.connect(DB, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
//   useFindAndModify: false
// });

const connection = new Promise((resolve, reject) => {
  mongoose
    .connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    .then(() => {
      console.log('Connection to DB');
      resolve();
    })
    .catch(error => {
      console.log(err);
      reject();
    });
});

axios.all([...requests, connection]).then(() => {
  console.log('All requests done');
  writeFiles();
  process.exit(1);
});
