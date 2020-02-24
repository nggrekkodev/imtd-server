const fs = require('fs');
const axios = require('axios');

// Read JSON FILE
const rawData = fs.readFileSync(`${__dirname}/dataExcelToJson.json`, 'utf-8');
// console.log(rawData);

const data = JSON.parse(rawData);
// console.log(data);

const api = 'https://api-adresse.data.gouv.fr/search/';
let querySearch = '';
const queryLimit = 1;
let queryPostCode = 0;

const requests = [];
const noGpsCoordinates = [];

const getGeoJson = ip => {
  return axios
    .get(api, {
      params: { q: `${ip.address1} ${ip.address2} ${ip.city} ${ip.postalCode}`, limit: queryLimit }
    })
    .then(res => {
      if (res.data.features.length > 0) {
        ip['coordinates'] = res.data.features[0].geometry.coordinates;
        console.log(`${ip.name} got coordinates : ${ip.coordinates}`);
      } else {
        // noGpsCoordinates.push(ip);
        // console.log(`${ip.name} got no coordinates`);
        console.log(`---> GPS coordinates not found for ${ip.name}, retry with name`);
        return axios
          .get(api, {
            params: { q: `LaMcube ${ip.address1} ${ip.address2} ${ip.city} ${ip.postalCode}`, limit: queryLimit }
          })
          .then(res => {
            if (res.data.features.length > 0) {
              ip['coordinates'] = res.data.features[0].geometry.coordinates;
              console.log(`${ip.name} got coordinates : ${ip.coordinates}`);
            } else {
              noGpsCoordinates.push(ip);
              console.log(`${ip.name} got no coordinates`);
            }
          });
      }
    })
    .catch(err => console.log(err));
};

for (const property in data) {
  data[property].forEach(ip => {
    requests.push(getGeoJson(ip));
  });
}

axios.all(requests).then(
  axios.spread(function(acct, perms) {
    console.log('---> ALL PROMISES DONE');
    const results = JSON.stringify(data);
    fs.writeFileSync('results.json', results);
    console.log('---> RESULTS WRITTEN');
    // POST TO DB RESULTS

    if (noGpsCoordinates.length > 0) {
      const errors = JSON.stringify(noGpsCoordinates);
      fs.writeFileSync('errors.json', errors);
      console.log('---> ERRORS WRITTEN');
      // NOT ENOUGH DATA TO GET A GPS COORDINATES
    }
  })
);
