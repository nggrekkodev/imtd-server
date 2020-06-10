const fs = require('fs');
const axios = require('axios');
const XLSX = require('xlsx');

const sheetsJson = {}; // each property is a sheet
// const fileName = 'data_v5_cut.xlsx';
const fileName = 'results.xlsx';
const fileOutput = 'results.xlsx';
let workbook;

const apiFR = 'https://api-adresse.data.gouv.fr/search/';
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

  // if (version === 1) {
  //   if (ip.type === 'Entreprise') {
  //     query = `${ip.street} ${ip.city} ${ip.postCode}`;
  //   } else if (ip.type === 'Laboratoire') {
  //     query = `${ip.street} ${ip.city} ${ip.name}`;
  //   } else if (ip.type === 'Formation') {
  //     query = `${ip.street} ${ip.city} ${ip.name}`;
  //   }
  // } else if (version === 2) {
  // }

  return query;
};

// Get coordinates of a location
const geocodeFR = async (ip, version, locationType) => {
  const querySearch = getQuery(ip, version);

  let res;
  try {
    res = await axios.get(apiFR, {
      params: { q: `${querySearch}`, limit: 1 },
    });
    // console.log(res.data);
  } catch (error) {
    // console.log(error);
  }
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

    const locationJSON = { ...ip };
    locationJSON['type'] = locationType;

    ipWithCoordinates.push(locationJSON);
    // console.log(`${ip.name} got coordinates : [${ip.latitude}:${ip.longitude}]`);
  } else {
    ipWithoutCoordinates.push(ip);
  }
  return true;
};

const transformLocations = () => {
  ipWithCoordinates.forEach((location) => {
    location.sectors = location.sectors.split(',').map((el) => el.trim());
    if (location.type === 'Formation') {
      console.log(location);

      if (location.formationLevels === undefined) {
        console.log('formationLevels : undefined');
        location.formationLevels = '-';
      } else {
        console.log('formationLevels : ', location.formationLevels);
        location.formationLevels = location.formationLevels.split(',').map((el) => el.trim());
      }
      // console.log(formationLevels);

      if (location.formationTypes === undefined) {
        console.log('formationTypes : undefined');
        location.formationLevels = '-';
      } else {
        console.log('formationTypes : ', location.formationTypes);
        location.formationTypes = location.formationTypes.split(',').map((el) => el.trim());
      }
    }
  });
};

const writeFiles = () => {
  try {
    // Write valid results to data.json
    const results = JSON.stringify(ipWithCoordinates);
    fs.writeFileSync(`${__dirname}/data.json`, results);
    console.log(`-> data.json created`);

    // Write invalid results to dataIncomplete.json
    if (ipWithoutCoordinates.length > 0) {
      const errors = JSON.stringify(ipWithoutCoordinates);
      fs.writeFileSync(`${__dirname}/dataIncomplete.json`, errors);
      console.log(`-> dataIncomplete.json created`);
    }

    // Convert each json sheet to a json array and add it has a property of sheetsJson
    for (const property in workbook.Sheets) {
      workbook.Sheets[property] = XLSX.utils.json_to_sheet(sheetsJson[property]);
    }
    // Write workbook data to a new xlsx file
    XLSX.writeFile(workbook, `${__dirname}/${fileOutput}`);
    console.log(`-> Excel file ${fileOutput} created`);
  } catch (error) {
    console.log(error);
  }
};

// try {
//   fs.unlinkSync(`${__dirname}/${fileOutput}`);
//   console.log(`-> ${fileOutput} deleted`);
// } catch (error) {}
try {
  fs.unlinkSync(`${__dirname}/dataIncomplete.json`);
  console.log(`-> dataIncomplete.json deleted`);
} catch (error) {}
try {
  fs.unlinkSync(`${__dirname}/data.json`);
  console.log(`-> data.json deleted`);
} catch (error) {}

// READ and CONVERT excel to json
try {
  // Read xlsx file
  workbook = XLSX.readFile(`${__dirname}/${fileName}`, { raw: true });

  // Convert each workbook sheet to a json array and add it has a property of sheetsJson
  for (const property in workbook.Sheets) {
    const sheetJson = XLSX.utils.sheet_to_json(workbook.Sheets[property]);
    sheetsJson[property] = sheetJson;
    // sheetJson.forEach(el => console.log(el.latitude + ' ' + el.longitude));
  }

  // For each excel sheet
  for (const property in sheetsJson) {
    console.log('*****************************************', property);
    // For each record of a sheet
    sheetsJson[property].forEach((ip) => {
      // console.log(ip);

      // If ip has no coordinates, push the promise to a promise array
      if (!ip.hasOwnProperty('latitude') || !ip.hasOwnProperty('longitude')) {
        // const ip2 = { ...ip };
        // ip2['type'] = property;
        requests.push(geocodeFR(ip, 1, property));
      }
      // Else, form the coordinates with latitude and longitude from excel data
      else {
        // parse string to number with + operator
        ip['longitude'] = +ip['longitude'];
        ip['latitude'] = +ip['latitude'];

        const locationJSON = { ...ip };
        locationJSON['type'] = property;
        ipWithCoordinates.push(locationJSON);
      }

      // Chain multiple fields into keywords field
      // const keywords = `${ip.name} ${ip.description} ${ip.keywords}`;
      // ip.keywords = keywords;

      // console.log(ip);
    });
  }

  axios.all(requests).then(() => {
    transformLocations();
    writeFiles();
  });
} catch (err) {
  console.log(err);
}

// // For each location
// for (const property in sheetsJson) {
//   sheetsJson[property].forEach((ip) => {
//     const typeLowerCase = property.toLowerCase();

//     // Add upper case to first character and last character 's'
//     const type = typeLowerCase.charAt(0).toUpperCase() + typeLowerCase.slice(0, -1).slice(1);
//     ip['type'] = type;

//     // If ip has no coordinates, push the promise to a promise array
//     if (!ip.hasOwnProperty('latitude') || !ip.hasOwnProperty('longitude')) {
//       requests.push(geocodeFR(ip, 1));
//     }
//     // Else, form the coordinates with latitude and longitude from excel data
//     else {
//       // parse string to number with + operator
//       ip['longitude'] = +ip['longitude'];
//       ip['latitude'] = +ip['latitude'];
//       ipWithCoordinates.push(ip);
//     }

//     // Chain multiple fields into keywords field
//     const keywords = `${ip.name} ${ip.description} ${ip.keywords}`;
//     ip.keywords = keywords;

//     const jsonIP = { ...ip };
//     const sectors = jsonIP.sector.split(',');
//     jsonIP.sector = sectors.map((el) => el.trim());
//   });
// }

// axios.all(requests).then(() => {
//   writeFiles();
// });
