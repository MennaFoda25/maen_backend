const express = require('express');
const morgan = require('morgan');
const dbConnection = require('./config/database');
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

//Routes
const userRoutes = require('./routes/userRoutes');

// Connect with db
dbConnection();

const app = express();

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}
app.use(express.json());

//Mount Routes
app.use('/api/v1/users', userRoutes);

app.all('*sth', (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

//Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//Handle errors outside express
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Errors: ${err.name}| ${err.message}`);
  server.close(() => {
    console.error('Shutting down.... Bye');
    process.exit(1);
  });
});
