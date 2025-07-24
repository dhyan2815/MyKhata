// authMiddleware.js

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// Middleware to protect routes and check for valid JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for authorization header and if it starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      // Verify token and decode payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Find user by ID from token, exclude password field
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      // If token verification fails
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    // If no token is found
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export { protect };