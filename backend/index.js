import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import propertiesRoutes from './routes/properties.js';
import chatRoutes from './routes/chat.js';
import contactRoutes from './routes/contact.js';
import transactionRoutes from './routes/transactions.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Check your MONGODB_URI in backend/.env and ensure your IP is whitelisted in Atlas Network Access.');
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.resolve('./uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
