require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const isUrl = require('is-url');

// db
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true, });
mongoose.connection.on('error', (err) =>
  console.error(`🚫 🙅 🚫 ${err.message} 🚫 🙅 🚫`)
);
const Url = require('./models');

// start
const app = express();

// basic
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

//* Turn raw req requests into usable properties in req.body!
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routing
app.get('/', (req, res) => res.sendFile(`${__dirname}/views/index.html`));

app.post('/api/shorturl/new', async (req, res, next) => {
  const input = req.body.url;
  // if input is not a valid url, return
  if (!isUrl(input)) return res.json({ error: 'invalid url', input });
  // if it is, first check if the url is already in db
  const existing = await Url.findOne({ original: input });
  // if it is already stored, return it
  if (existing) return res.json({ original_url: existing.original, short_url: existing.short });
  // if not, save to db (the short url is added by mongoose on pre-save)
  const saved = await new Url({ original: input }).save();
  // return saved original + short urls, as a json object
  return res.json({ original_url: saved.original, short_url: saved.short });
});

app.get('/api/shorturl/:short', async (req, res, next) => {
  const { short } = req.params;
  // if not a number, return error (all shorts are consecutive numbers 🤷‍♂️)
  if (isNaN(short)) return res.json({ error: `${short} is not a valid short url, try again please` });
  // find the short param in db
  const found = await Url.findOne({ short });
  // if not found, return a json object with a no found message
  if (!found || !found.original) return res.json({ error: `${short} is not a short url yet, try again please` });
  // if found, redirect to the original url
  return res.redirect(found.original);
});

// go 🚀
const listener = app.listen(process.env.PORT || 7717, () =>
  console.log(`Your app is ready -> http://localhost:${listener.address().port} 🚀🚀`)
);