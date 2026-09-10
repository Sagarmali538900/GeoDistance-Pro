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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sagarmali5389_db_user:tZqgMJqtv1WzIG4F@cluster0.cimmjuo.mongodb.net/geometrics?retryWrites=true&w=majority&appName=Cluster0';

app.use(cors());
app.use(express.json());

let isMongoConnected = false;
let memoryStore = {
  users: [{ _id: 'u-1', name: 'Sagar Mali', role: 'Field Agent', lastActive: new Date() }],
  history: [],
  tours: []
};

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI)
  .then(() => {
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected successfully to MongoDB Atlas: ${MONGODB_URI}`);
  })
  .catch((err) => {
    isMongoConnected = false;
    console.warn(`⚠️ MongoDB connection error (${err.message}). Using in-memory fallback.`);
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

app.get('/api/users', async (req, res) => {
  try {
    if (isMongoConnected) {
      const users = await User.find().sort({ lastActive: -1 }).lean();
      const usersWithCounts = await Promise.all(
        users.map(async (u) => {
          const regex = new RegExp(`^${u.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
          const count = await CalculationHistory.countDocuments({ userName: regex });
          return { ...u, calculationsCount: count };
        })
      );
      res.json(usersWithCounts);
    } else {
      res.json(memoryStore.users.map(u => ({
        ...u,
        calculationsCount: memoryStore.history.filter(h => h.userName.toLowerCase() === u.name.toLowerCase()).length
      })));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'User name is required' });
    }

    const trimmedName = name.trim();

    if (isMongoConnected) {
      const regex = new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      let user = await User.findOne({ name: regex });
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

app.post('/api/history', async (req, res) => {
  try {
    const { userName, locations, result, travelMode } = req.body;
    
    if (!userName || !locations || locations.length < 2) {
      return res.status(400).json({ error: 'Invalid calculation payload' });
    }

    const trimmedName = userName.trim();

    if (isMongoConnected) {
      const regex = new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      await User.findOneAndUpdate(
        { name: regex },
        { name: trimmedName, lastActive: new Date() },
        { upsert: true, new: true }
      );

      const historyItem = await CalculationHistory.create({
        userName: trimmedName,
        locations,
        result,
        travelMode: travelMode || 'DRIVING'
      });
      return res.status(201).json(historyItem);
    } else {
      const historyItem = {
        _id: `h-${Date.now()}`,
        userName: trimmedName,
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

app.get('/api/history/all', async (req, res) => {
  try {
    if (isMongoConnected) {
      const history = await CalculationHistory.find().sort({ createdAt: -1 }).limit(100);
      res.json(history);
    } else {
      res.json(memoryStore.history);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:userName/history', async (req, res) => {
  try {
    const { userName } = req.params;
    const cleanName = decodeURIComponent(userName).trim();

    if (isMongoConnected) {
      const regex = new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
      const history = await CalculationHistory.find({ userName: regex }).sort({ createdAt: -1 }).limit(50);
      res.json(history);
    } else {
      const filtered = memoryStore.history.filter(h => 
        h.userName.toLowerCase().startsWith(cleanName.toLowerCase()) ||
        cleanName.toLowerCase().startsWith(h.userName.toLowerCase())
      );
      res.json(filtered);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TOUR MANAGEMENT ROUTES ---

app.get('/api/tours', async (req, res) => {
  try {
    const { assignedUser, status } = req.query;
    const filter = {};
    if (assignedUser && assignedUser !== 'ALL') {
      filter.assignedUser = new RegExp(`^${assignedUser.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    }
    if (status && status !== 'ALL') filter.status = status;

    if (isMongoConnected) {
      const tours = await Tour.find(filter).sort({ createdAt: -1 });
      res.json(tours);
    } else {
      let tours = [...memoryStore.tours];
      if (assignedUser && assignedUser !== 'ALL') tours = tours.filter(t => t.assignedUser.toLowerCase().includes(assignedUser.toLowerCase()));
      if (status && status !== 'ALL') tours = tours.filter(t => t.status === status);
      res.json(tours);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tours', async (req, res) => {
  try {
    const { title, description, assignedUser, locations, result, status, travelMode, startDate } = req.body;

    if (!title || !assignedUser || !locations || locations.length < 2) {
      return res.status(400).json({ error: 'Title, assigned user, and locations are required.' });
    }

    if (isMongoConnected) {
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
    } else {
      const newTour = {
        _id: `tour-${Date.now()}`,
        title,
        description,
        assignedUser: assignedUser.trim(),
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

app.put('/api/tours/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assignedUser, locations, result, status, travelMode } = req.body;

    if (isMongoConnected) {
      const updated = await Tour.findByIdAndUpdate(
        id,
        {
          title,
          description,
          assignedUser: assignedUser ? assignedUser.trim() : '',
          locations,
          result,
          status,
          travelMode
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Tour not found' });
      res.json(updated);
    } else {
      const tourIndex = memoryStore.tours.findIndex(t => String(t._id) === String(id));
      if (tourIndex !== -1) {
        memoryStore.tours[tourIndex] = {
          ...memoryStore.tours[tourIndex],
          title,
          description,
          assignedUser: assignedUser ? assignedUser.trim() : '',
          locations,
          result,
          status,
          travelMode
        };
        res.json(memoryStore.tours[tourIndex]);
      } else {
        res.status(404).json({ error: 'Tour not found' });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tours/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (isMongoConnected) {
      const updated = await Tour.findByIdAndUpdate(id, { status }, { new: true });
      res.json(updated);
    } else {
      const tour = memoryStore.tours.find(t => String(t._id) === String(id));
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

app.delete('/api/tours/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      await Tour.findByIdAndDelete(id);
      res.json({ message: 'Tour deleted successfully', id });
    } else {
      memoryStore.tours = memoryStore.tours.filter(t => String(t._id) !== String(id));
      res.json({ message: 'Tour deleted successfully', id });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 GeoMetrics Backend API Server running on port ${PORT}`);
});
