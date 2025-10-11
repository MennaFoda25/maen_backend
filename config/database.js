const mongoose = require('mongoose');

const dbConnection = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then((conn) => {
      console.log(`DB connected successfully: ${conn.connection.host}`);
    })
    // .catch((err) => {
    //   console.error(`DB connection error: ${err}`);
    //   process.exit(1);
    // });
};

module.exports = dbConnection;
