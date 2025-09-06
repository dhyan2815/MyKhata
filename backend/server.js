// backend/server.js

import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import compression from 'compression';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import cors from 'cors';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable compression for better performance
app.use(compression());

const allowedOrigins = ['http://localhost:5173', 'https://mykhataa.onrender.com'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Increase payload limit for file uploads but add security
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);

// Welcome ROOT route
app.get('/', (req, res) => {
  res.send('MyKhata API is running');
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  // Render backend server
  // console.log(`Server running on https://mykhata-backend.onrender.com`);
  console.log(`Server running on http://localhost:${PORT}`);
});