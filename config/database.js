const mongoose = require('mongoose');

const dbConnection = () => {
  mongoose.connect(process.env.DB_URI).then((conn) => {
    console.log(`DB connected successfully: ${conn.connection.host}`);
  });
};

module.exports = dbConnection;
