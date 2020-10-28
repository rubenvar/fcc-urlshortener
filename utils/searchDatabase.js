const mongo = require('mongodb').MongoClient;

module.exports = function searchDatabase(string, res) {
  mongo.connect(
    process.env.DATABASE_URI,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) throw err;

      const db = client.db(process.env.DB);
      const urls = db.collection('urls');

      urls
        .find({ _id: string }, { projection: { _id: 0, original_url: 1 } })
        .next((err, docs) => {
          if (err) throw err;

          if (docs === null) {
            res.json({
              error:
                'This short url is not on the database, check it again please',
            });
          } else {
            const url = docs.original_url;
            res.redirect(url);
          }
          client.close(err => {
            if (err) throw err;
          });
        });
    }
  );
};
