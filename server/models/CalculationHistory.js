import mongoose from 'mongoose';

const CalculationHistorySchema = new mongoose.Schema({
  userName: {
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
    totalDistanceMeters: { type: Number },
    legs: [
      {
        from: String,
        to: String,
        distanceText: String,
        durationText: String
      }
    ]
  },
  travelMode: {
    type: String,
    default: 'DRIVING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('CalculationHistory', CalculationHistorySchema);
