const express = require('express');
const morgan = require('morgan');
const dbConnection = require('./config/database');
const cors = require('cors');
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');
const swaggerDocument = require('./config/swagger');
const swaggerUi = require('swagger-ui-express');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
// Connect with db
dbConnection();

//Routes
const userRoutes = require('./routes/userRoutes');
const teacherRequestRoutes = require('./routes/teacherRequestRoutes');
const authRoutes = require('./routes/authRoutes');
const correctionRoutes = require('./routes/correctionProgramRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const memorizationRoutes = require('./routes/memorizationProgramRoutes');
const childRoutes = require('./routes/childProgramRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const programRoutes = require('./routes/programRoutes');
const eventRoutes = require('./routes/eventRoutes');
const planRoutes = require('./routes/pricingPlanRoutes')
const chatRoutes = require('./routes/chatRoutes')
const promocodeRoutes = require('./routes/promocodeRoutes')
const pricingRoutes = require('./routes/pricingPlanRoutes')
const mp3Routes = require('./routes/mp3Routes')
const notificationRoutes = require('./routes/notificationRoutes');
const app = express();

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

//Mount Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/teacherRequest', teacherRequestRoutes);
app.use('/api/v1/programs/correction', correctionRoutes);
app.use('/api/v1/programs/memorization', memorizationRoutes);
app.use('/api/v1/programs/child', childRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/programs', programRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/plans',planRoutes)
app.use('/api/v1/chats', chatRoutes)
app.use('/api/v1/pricing',pricingRoutes)
app.use('/api/v1/promocode',promocodeRoutes)
app.use('/api/v1/upload',mp3Routes)
app.use('/api/v1/notifications', notificationRoutes);
// Serve Swagger UI (automatic with CSS/JS)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
console.log('Swagger UI available at /api-docs');

app.get('/', (req, res) => {
  res.send({
    status: 'success',
    message: 'Maen Backend API is running',
    docs: '/api-docs',
  });
});

// Health check endpoint (important for Vercel)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});
// app.use('*',(req, res, next) => {
//   next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
// });

app.all('*sth', (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

// Global error handling middleware
app.use(globalError);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error('Shutting down.... Bye');
    process.exit(1);
  });
});
//}
