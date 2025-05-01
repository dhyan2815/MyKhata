import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const corsOptions = {
  // '*' for allowing all origins

  // For Mobile frontend server
  // origin: 'http://192.168.1.90:5173',

  // For Local frontend server
  // origin: 'http://localhost:5173',

  // For Render frontend server
  origin: 'https://mykhata-frontend.onrender.com',  

  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.send('MyKhata API is running');
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

// For local backend server || 0.0.0.0 for Mobile backend server
app.listen(PORT, '0.0.0.0', () => {

  console.log(`Server running on port http://localhost:${PORT}`);

  // For Render backend server
  // console.log(`Server running on https://mykhata-backend.onrender.com`);
});
