import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from './models/User.js';
import CalculationHistory from './models/CalculationHistory.js';
import Tour from './models/Tour.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/geometrics';

app.use(cors());
app.use(express.json());

// In-Memory Fallback Storage if MongoDB is disconnected
let isMongoConnected = false;
const memoryStore = {
  users: [{ _id: 'u-1', name: 'Default User', role: 'Field Agent', lastActive: new Date() }],
  history: [],
  tours: []
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected successfully to: ${MONGODB_URI}`);
  })
  .catch((err) => {
    isMongoConnected = false;
    console.warn(`⚠️ Could not connect to MongoDB (${err.message}). Using in-memory fallback store.`);
  });

// Status check API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    mongoConnected: isMongoConnected,
    databaseUri: MONGODB_URI
  });
});

// --- USER ROUTES ---

// Get all users/team members
app.get('/api/users', async (req, res) => {
  try {
    if (isMongoConnected) {
      const users = await User.find().sort({ lastActive: -1 });
      res.json(users);
    } else {
      res.json(memoryStore.users);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get or Create User by Name
app.post('/api/users', async (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'User name is required' });
    }

    const trimmedName = name.trim();

    if (isMongoConnected) {
      let user = await User.findOne({ name: trimmedName });
      if (!user) {
        user = await User.create({ name: trimmedName, role: role || 'Field Agent' });
      } else {
        user.lastActive = new Date();
        await user.save();
      }
      return res.json(user);
    } else {
      let user = memoryStore.users.find(u => u.name.toLowerCase() === trimmedName.toLowerCase());
      if (!user) {
        user = { _id: `u-${Date.now()}`, name: trimmedName, role: role || 'Field Agent', lastActive: new Date() };
        memoryStore.users.push(user);
      } else {
        user.lastActive = new Date();
      }
      return res.json(user);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DISTANCE CALCULATION HISTORY ROUTES ---

// Save Distance Calculation History
app.post('/api/history', async (req, res) => {
  try {
    const { userName, locations, result, travelMode } = req.body;
    
    if (!userName || !locations || locations.length < 2) {
      return res.status(400).json({ error: 'Invalid calculation payload' });
    }

    if (isMongoConnected) {
      // Ensure user exists and update lastActive
      await User.findOneAndUpdate(
        { name: userName },
        { lastActive: new Date() },
        { upsert: true, new: true }
      );

      const historyItem = await CalculationHistory.create({
        userName,
        locations,
        result,
        travelMode: travelMode || 'DRIVING'
      });
      return res.status(201).json(historyItem);
    } else {
      const historyItem = {
        _id: `h-${Date.now()}`,
        userName,
        locations,
        result,
        travelMode: travelMode || 'DRIVING',
        createdAt: new Date()
      };
      memoryStore.history.unshift(historyItem);
      return res.status(201).json(historyItem);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get History for specific User or All
app.get('/api/users/:userName/history', async (req, res) => {
  try {
    const { userName } = req.params;
    if (isMongoConnected) {
      const history = await CalculationHistory.find({ userName }).sort({ createdAt: -1 }).limit(30);
      res.json(history);
    } else {
      const filtered = memoryStore.history.filter(h => h.userName.toLowerCase() === userName.toLowerCase());
      res.json(filtered);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TOUR MANAGEMENT ROUTES ---

// Get all Tours
app.get('/api/tours', async (req, res) => {
  try {
    const { assignedUser, status } = req.query;
    const filter = {};
    if (assignedUser) filter.assignedUser = assignedUser;
    if (status) filter.status = status;

    if (isMongoConnected) {
      const tours = await Tour.find(filter).sort({ createdAt: -1 });
      res.json(tours);
    } else {
      let tours = [...memoryStore.tours];
      if (assignedUser) tours = tours.filter(t => t.assignedUser === assignedUser);
      if (status) tours = tours.filter(t => t.status === status);
      res.json(tours);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new Tour
app.post('/api/tours', async (req, res) => {
  try {
    const { title, description, assignedUser, locations, result, status, travelMode, startDate } = req.body;

    if (!title || !assignedUser || !locations || locations.length < 2) {
      return res.status(400).json({ error: 'Title, assigned user, and at least 2 locations are required.' });
    }

    if (isMongoConnected) {
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
    } else {
      const newTour = {
        _id: `tour-${Date.now()}`,
        title,
        description,
        assignedUser,
        locations,
        result,
        status: status || 'PLANNED',
        travelMode: travelMode || 'DRIVING',
        startDate: startDate ? new Date(startDate) : new Date(),
        createdAt: new Date()
      };
      memoryStore.tours.unshift(newTour);
      res.status(201).json(newTour);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Tour status
app.patch('/api/tours/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (isMongoConnected) {
      const updated = await Tour.findByIdAndUpdate(id, { status }, { new: true });
      res.json(updated);
    } else {
      const tour = memoryStore.tours.find(t => t._id === id);
      if (tour) {
        tour.status = status;
        res.json(tour);
      } else {
        res.status(404).json({ error: 'Tour not found' });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Tour
app.delete('/api/tours/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await Tour.findByIdAndDelete(id);
    } else {
      memoryStore.tours = memoryStore.tours.filter(t => t._id !== id);
    }
    res.json({ message: 'Tour deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 GeoMetrics Backend API Server running on port ${PORT}`);
});
