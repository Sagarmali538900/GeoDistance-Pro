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

async function connectDb() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
  } catch (err) {
    console.warn("MongoDB Atlas connection error:", err.message);
  }
}

app.use(async (req, res, next) => {
  await connectDb();
  next();
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    mongoConnected: mongoose.connection.readyState === 1,
    environment: 'vercel-serverless'
  });
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ lastActive: -1 }).lean();
    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const regex = new RegExp(`^${u.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
        const count = await CalculationHistory.countDocuments({ userName: regex });
        return { ...u, calculationsCount: count };
      })
    );
    res.json(usersWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ error: 'Name is required' });
    
    const trimmed = name.trim();
    const regex = new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    let user = await User.findOne({ name: regex });
    if (!user) {
      user = await User.create({ name: trimmed, role: role || 'Field Agent' });
    } else {
      user.lastActive = new Date();
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    const { userName, locations, result, travelMode } = req.body;
    if (!userName || !locations || locations.length < 2) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const trimmed = userName.trim();
    const regex = new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    await User.findOneAndUpdate({ name: regex }, { name: trimmed, lastActive: new Date() }, { upsert: true });

    const item = await CalculationHistory.create({
      userName: trimmed,
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
    const cleanName = decodeURIComponent(userName).trim();
    const regex = new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    const history = await CalculationHistory.find({ userName: regex }).sort({ createdAt: -1 }).limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tours', async (req, res) => {
  try {
    const { assignedUser, status } = req.query;
    const filter = {};
    if (assignedUser) {
      filter.assignedUser = new RegExp(`^${assignedUser.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    }
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
      assignedUser: assignedUser.trim(),
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

app.put('/api/tours/:id', async (req, res) => {
  try {
    const { title, description, assignedUser, locations, result, status, travelMode } = req.body;
    const updated = await Tour.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedUser: assignedUser ? assignedUser.trim() : '', locations, result, status, travelMode },
      { new: true }
    );
    res.json(updated);
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
    res.json({ message: 'Deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
