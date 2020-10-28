require('dotenv').config();
const express = require('express');
const searchDatabase = require('./utils/searchDatabase');
const writeToDatabase = require('./utils/writeToDatabase');

const app = express();
let homeUrl = '';

function createShort(url) {
  let randomString = '';
  for (let x = 0; x < 6; x++) {
    const random = Math.floor(Math.random() * 10);
    randomString += random;
  }
  const shortUrl = `${homeUrl}/${randomString}`;

  writeToDatabase(randomString, url, shortUrl);
  return { original_url: url, short_url: shortUrl };
}

function handleInput(input) {
  // check if input is a valid url
  const urlRegex = /(^https?):\/\/(\w+:{0,1}\w*)?\.+(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-/]))?/gm;
  if (urlRegex.test(input)) {
    return createShort(input);
  }
  return { error: 'Invalid url, check it again please' };
}

// routing, index
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});

// shorten a url
app.get('/s/*', (req, res) => {
  homeUrl = `${req.protocol}://${req.get('host')}`;
  const url = req.params[0];
  const obj = handleInput(url);
  res.json(obj);
});

// search for original url from short, and redirect to original
app.get('/*', (req, res) => {
  const str = req.params[0];
  searchDatabase(str, res);
  // TODO searchDatabase should return something
});

const listener = app.listen('3000', function() {
  console.log(
    `Your app is ready -> http://localhost:${listener.address().port} 🚀🚀`
  );
});
