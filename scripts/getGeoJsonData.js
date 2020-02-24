const fs = require('fs');
const axios = require('axios');
const excelToJson = require('convert-excel-to-json');
const jsonToExcel = require('json2xls');

// convert excel file to object
const rawData = excelToJson({
  sourceFile: `${__dirname}/data_v2.xlsx`
});

const data = {};

// Loop through each type of interest point (entreprises, labos, formations)
for (const property in rawData) {
  // array of interest points of 1 type
  const interestPoints = [];

  // Loop through each interest point of a type
  for (let i = 1; i < rawData[property].length; i++) {
    const ip = {};

    if (property === 'ENTREPRISES') {
      ip['type'] = 'Entreprise';
    } else if (property === 'LABOS') {
      ip['type'] = 'Labo';
    } else if (property === 'FORMATIONS') {
      ip['type'] = 'Formation';
    } else {
    }

    // Loop through each property of an interest point
    for (const prop in rawData[property][i]) {
      ip[rawData[property][0][prop]] = rawData[property][i][prop];
    }

    // console.log(ip);
    // add interest point to array
    interestPoints.push(ip);
  }

  // add array as a property : data["ENTREPRISES"] = [...]
  data[property] = interestPoints;
}

// const xls = jsonToExcel(rawData['ENTREPRISES']);
const xls = jsonToExcel({
  name: 'Ivy Dickson',
  date: '2013-05-27T11:04:15-07:00',
  number: 10,
  nested: {
    field: 'foo'
  }
});
fs.writeFileSync('results.xlsx', xls, 'binary');
// console.log(data);

/*
// Read JSON FILE
const rawData = fs.readFileSync(`${__dirname}/dataExcelToJson.json`, 'utf-8');
// console.log(rawData);

const data = JSON.parse(rawData);
// console.log(data);
*/

/*
const api = 'https://api-adresse.data.gouv.fr/search/';

const requests = [];
const ipWithCoordinates = [];
const ipWithoutCoordinates = [];

const getInterestPointCoordinates = ip => {
  let querySearch = '';
  if (ip.type === 'Entreprise') {
    querySearch = `${ip.street} ${ip.location} ${ip.city}`;
  } else if (ip.type === 'Labo') {
    querySearch = `${ip.street} ${ip.fullName} ${ip.location}`;
  } else if (ip.type === 'Formation') {
    querySearch = `${ip.name} ${ip.street} ${ip.location}`;
  }

  return axios
    .get(api, {
      params: { q: `${querySearch}`, limit: 1, postcode: ip.postCode }
    })
    .then(res => {
      if (res.data.features.length > 0) {
        ip['coordinates'] = res.data.features[0].geometry.coordinates;
        ip['latitude'] = res.data.features[0].geometry.coordinates[1];
        ip['longitude'] = res.data.features[0].geometry.coordinates[0];
        ipWithCoordinates.push(ip);
        console.log(`${ip.name} got coordinates : ${ip.coordinates}`);
      } else {
        console.log(`---> GPS coordinates not found for ${ip.name}, retry with name`);
        ipWithoutCoordinates.push(ip);
      }
    })
    .catch(err => console.log(err));
};

for (const property in data) {
  data[property].forEach(ip => {
    if (!ip.hasOwnProperty('latitude') || !ip.hasOwnProperty('longitude')) {
      requests.push(getInterestPointCoordinates(ip));
    } else {
      ip['coordinates'] = [ip['longitude'], ip['latitude']];
      ipWithCoordinates.push(ip);
    }
  });
}

axios.all(requests).then(
  axios.spread(function(acct, perms) {
    console.log('---> ALL PROMISES DONE');
    const results = JSON.stringify(ipWithCoordinates);
    fs.writeFileSync('results.json', results);
    console.log('---> RESULTS WRITTEN');
    // POST TO DB RESULTS

    if (ipWithoutCoordinates.length > 0) {
      const errors = JSON.stringify(ipWithoutCoordinates);
      fs.writeFileSync('errors.json', errors);
      console.log('---> ERRORS WRITTEN');
      // NOT ENOUGH DATA TO GET A GPS COORDINATES
    }
  })
);

*/
