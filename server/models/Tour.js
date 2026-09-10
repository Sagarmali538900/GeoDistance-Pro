import mongoose from 'mongoose';

const TourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  assignedUser: {
    type: String,
    required: true,
    index: true
  },
  locations: [
    {
      address: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number }
    }
  ],
  result: {
    totalDistanceKm: { type: String },
    totalDistanceMiles: { type: String },
    totalDurationFormatted: { type: String },
    totalDistanceMeters: { type: Number }
  },
  status: {
    type: String,
    enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PLANNED'
  },
  travelMode: {
    type: String,
    default: 'DRIVING'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Tour', TourSchema);
