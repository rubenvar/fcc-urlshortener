// init project
const express = require('express');
const mongo = require('mongodb').MongoClient;
const app = express();
let homeUrl = '';

let validUrl = '';
// connect to database: Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname, details set in .env
const uri = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.PORT+'/'+process.env.DB;

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

// shorten a url
app.get('/s/*', (req, res) => {
  homeUrl = req.protocol + '://' + req.get('host');
  let url = req.params[0];
  let obj = handleInput(url);
  res.json(obj);
});

// search for original url from short, and redirect to original
app.get('/*', (req, res) => {
  let str = req.params[0];
  // instead of print it, look for it in the db and redirect to asociated original
  // y si la rand string no está en la db, output otro error
  let result = searchDatabase(str, res);
  //res.json(result); // lo que hace ahora es solo output la string
});

function searchDatabase(string, response) {
  mongo.connect(uri, (err, client) => {
    if (err) throw (err);
    console.log('connected to db');
    
    const db = client.db(process.env.DB);
    let urls = db.collection('urls');
    console.log('accessing collection "urls"');
    
    urls.find(
      { _id: string },
      { projection: { _id: 0, original_url: 1 } },
    ).next((err, docs) => {
      if (err) throw (err);
      if (docs === null) {
        console.log('nothing found');
        response.json({error: "This short url is not on the database, check it again please"});
      } else {
        console.log('found the url!');
        let url = docs['original_url'];
        response.redirect(url);
      }
      client.close((err) => {
        if (err) throw (err);
        console.log('closing the connection');
      });
    });
  });
}

function writeToDatabase(randomString, originalUrl, shortUrl) {
  let inputObj = [
    {
      _id: randomString,
      original_url: originalUrl,
      short_url: shortUrl
    }
  ];
  
  mongo.connect(uri, (err, client) => {
    if (err) throw (err);
    console.log('connected to db');
    
    const db = client.db(process.env.DB);
    let urls = db.collection('urls');
    console.log('creating collection "urls"');
    
    urls.insert(inputObj, (err, result) => {
      if (err) throw (err);
      console.log('data inserted in db');
    });
  });
}

function createShort(url) {
  let randomString = '';
  for (let x = 0; x < 6; x++) {
    let random = Math.floor(Math.random() * 10);
    randomString += random;
  }
  // create obj with original url and site url+random string
  // write to collection in db
  // first write a collection
  let shortUrl = homeUrl + '/' + randomString;
  writeToDatabase(randomString, url, shortUrl);
  return {original_url: url, short_url: shortUrl};
}

function handleInput(input) {
  // check if input is a valid url
  let urlRegex = /(^https?)\:\/\/(\w+:{0,1}\w*)?\.+(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/gm;
  if (urlRegex.test(input)) {
    return createShort(input);
  } else {
    return {error: "Invalid url, check it again please"};
  }
}

const listener = app.listen("3000", function () {
  console.log('Your app is listening on port ' + listener.address().port);
});