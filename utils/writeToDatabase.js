const mongo = require('mongodb').MongoClient;

module.exports = function writeToDatabase(randomString, originalUrl, shortUrl) {
  const inputObj = {
    _id: randomString,
    original_url: originalUrl,
    short_url: shortUrl,
  };

  mongo.connect(
    process.env.DATABASE_URI,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) throw err;

      const db = client.db(process.env.DB);
      const urls = db.collection('urls');

      urls.insertOne(inputObj, (err, result) => {
        if (err) throw err;
        console.log(
          `success: ${result.insertedCount} new elem in db, with _id: ${result.insertedId}`
        );
      });
    }
  );
};
