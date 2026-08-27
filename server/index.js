import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './src/config/db.js';
import { sendSuccess } from './src/utils/apiResponse.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';

import authRoutes from './src/routes/authRoutes.js';
import branchRoutes from './src/routes/branchRoutes.js';
import loanProductRoutes from './src/routes/loanProductRoutes.js';
import loanApplicationRoutes from './src/routes/loanApplicationRoutes.js';
import emiRoutes from './src/routes/emiRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import auditLogRoutes from './src/routes/auditLogRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import { sanitizeInputs } from './src/middleware/sanitizer.js';
import { apiRateLimiter } from './src/middleware/rateLimiter.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(sanitizeInputs);
app.use('/api', apiRateLimiter);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(res, { status: 'UP', timestamp: new Date() }, 'FinSure API server is running smoothly');
});

app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/loan-products', loanProductRoutes);
app.use('/api/loans', loanApplicationRoutes);
app.use('/api/emi', emiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => {
  res.send('FinSure API Service Version 1.0');
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

