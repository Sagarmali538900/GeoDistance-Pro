import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import User from '../server/models/User.js';
import CalculationHistory from '../server/models/CalculationHistory.js';
import Tour from '../server/models/Tour.js';

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/geometrics';

let isConnected = false;

// Connect to MongoDB Atlas or local MongoDB
async function connectDb() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
  } catch (err) {
    console.warn("MongoDB Atlas connection error:", err.message);
  }
}

// Ensure DB connection before handling API request
app.use(async (req, res, next) => {
  await connectDb();
  next();
});

// Status Endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    mongoConnected: mongoose.connection.readyState === 1,
    environment: 'vercel-serverless'
  });
});

// Users REST Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ lastActive: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ error: 'Name is required' });
    
    let user = await User.findOne({ name: name.trim() });
    if (!user) {
      user = await User.create({ name: name.trim(), role: role || 'Field Agent' });
    } else {
      user.lastActive = new Date();
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// History Routes
app.post('/api/history', async (req, res) => {
  try {
    const { userName, locations, result, travelMode } = req.body;
    if (!userName || !locations || locations.length < 2) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    await User.findOneAndUpdate({ name: userName }, { lastActive: new Date() }, { upsert: true });

    const item = await CalculationHistory.create({
      userName,
      locations,
      result,
      travelMode: travelMode || 'DRIVING'
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:userName/history', async (req, res) => {
  try {
    const { userName } = req.params;
    const history = await CalculationHistory.find({ userName }).sort({ createdAt: -1 }).limit(30);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tour Routes
app.get('/api/tours', async (req, res) => {
  try {
    const { assignedUser, status } = req.query;
    const filter = {};
    if (assignedUser) filter.assignedUser = assignedUser;
    if (status) filter.status = status;

    const tours = await Tour.find(filter).sort({ createdAt: -1 });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tours', async (req, res) => {
  try {
    const { title, description, assignedUser, locations, result, status, travelMode, startDate } = req.body;
    const newTour = await Tour.create({
      title,
      description,
      assignedUser,
      locations,
      result,
      status: status || 'PLANNED',
      travelMode: travelMode || 'DRIVING',
      startDate: startDate ? new Date(startDate) : new Date()
    });
    res.status(201).json(newTour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tours/:id', async (req, res) => {
  try {
    const updated = await Tour.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tours/:id', async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
