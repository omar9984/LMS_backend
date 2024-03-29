const mongoose = require('mongoose');

module.exports = function () {
  if (process.env.NODE_ENV == 'test') {
    mongoose
      .connect(global.__MONGO_URI__, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
      })
      .then(() => {
        console.log('DB connection successful! testing');
      })
      .catch(err => {
        process.exit(1);
      });
  } else {
    const DB = process.env.DATABASE.replace(
      '<PASSWORD>',
      process.env.DATABASE_PASSWORD
    );
    mongoose
      .connect(DB, {
        useNewUrlParser: true,
        // useCreateIndex: true,
        // useFindAndModify: false,
        useUnifiedTopology: true
      })
      .then(() => {
        console.log('DB connection successful! online');
      })
      .catch(err => {
        const DBLocal = process.env.DATABASE_LOCAL;
        mongoose
          .connect(DBLocal, {
            useNewUrlParser: true,
            //useCreateIndex: true
            // useFindAndModify: false,
            useUnifiedTopology: true
          })
          .then(() => {
            console.log('DB connection successful! local');
          })
          .catch(err => {
            console.log("failed to connect to db")
            process.exit();
          });
      });
  }
};