const fs = require('fs');
const axios = require('axios');
const XLSX = require('xlsx');

const sheetsJson = {}; // each property is a sheet
const fileName = 'data_v2.xlsx';
const fileOutput = 'data_v2_geo.xlsx';
let workbook;

const frenchGovApi = 'https://api-adresse.data.gouv.fr/search/';
const requests = [];
const ipWithCoordinates = [];
const ipWithoutCoordinates = [];
const latitudeMin = 48.830042;
const latitudeMax = 51.089338;
const longitudeMax = 4.25398;
const longitudeMin = 1.378651;

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
const getCoordinatesFromFrenchGovApi = (ip, version) => {
  const querySearch = getQuery(ip, version);

  return axios
    .get(frenchGovApi, {
      params: { q: `${querySearch}`, limit: 1 /*postcode: ip.postCode */ }
    })
    .then(res => {
      // API sent results
      if (
        res.data.features.length > 0 &&
        res.data.features[0].geometry.coordinates[1] > latitudeMin &&
        res.data.features[0].geometry.coordinates[1] < latitudeMax &&
        res.data.features[0].geometry.coordinates[0] > longitudeMin &&
        res.data.features[0].geometry.coordinates[0] < longitudeMax
      ) {
        // ip['coordinates'] = res.data.features[0].geometry.coordinates;
        ip['latitude'] = res.data.features[0].geometry.coordinates[1];
        ip['longitude'] = res.data.features[0].geometry.coordinates[0];
        ipWithCoordinates.push(ip);
        console.log(`${ip.name} got coordinates : [${ip.latitude}:${ip.longitude}]`);
      }
      // API did not send results
      else {
        console.log(`---> GPS coordinates not found for ${ip.name}, retry with name`);
        ipWithoutCoordinates.push(ip);
      }
      return Promise.resolve();
    })
    .catch(err => {
      console.log(err);
      return Promise.reject();
    });
};

const writeFiles = () => {
  try {
    const results = JSON.stringify(ipWithCoordinates);
    fs.writeFileSync(`${__dirname}/data.json`, results);
    console.log('---> RESULTS WRITTEN');

    if (ipWithoutCoordinates.length > 0) {
      const errors = JSON.stringify(ipWithoutCoordinates);
      fs.writeFileSync(`${__dirname}/dataIncomplete.json`, errors);
      console.log('---> ERRORS WRITTEN');
    }

    // Convert each json sheet to a json array and add it has a property of sheetsJson
    for (const property in workbook.Sheets) {
      workbook.Sheets[property] = XLSX.utils.json_to_sheet(sheetsJson[property]);
    }

    XLSX.writeFile(workbook, `${__dirname}/${fileOutput}`);
    console.log('---> EXCEL FILE WRITTEN');
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

axios.all(requests).then(() => {
  writeFiles();
  // if (ipWithoutCoordinates.length > 0) {
  //   ipWithoutCoordinates.forEach(ip => {});
  // }
});
// axios.all(requests).then(
//   axios.spread(function(acct, perms) {
//     console.log('---> FIRST ITERATION DONE');

//     // if () {

//     // }

//     writeFiles();
//   })
// );
