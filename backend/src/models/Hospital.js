import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      default: 'Surat',
    },
    location: {
      latitude: {
        type: Number,
        required: true,
        default: 21.1780,
      },
      longitude: {
        type: Number,
        required: true,
        default: 72.8250,
      },
    },
    emergencyContact: {
      phone: String,
      hotline: String,
      email: String,
    },
    traumaLevel: {
      type: String,
      enum: ['Level 1', 'Level 2', 'Level 3', 'Community Emergency'],
      default: 'Level 1',
    },
    totalBeds: {
      type: Number,
      default: 50,
    },
    availableBeds: {
      type: Number,
      default: 14,
    },
    icuBedsTotal: {
      type: Number,
      default: 15,
    },
    icuBedsAvailable: {
      type: Number,
      default: 4,
    },
    readinessStatus: {
      traumaTeamOnStandby: { type: Boolean, default: true },
      cathLabReady: { type: Boolean, default: true },
      bloodBankReady: { type: Boolean, default: true },
      emergencyBaysOpen: { type: Number, default: 3 },
    },
    status: {
      type: String,
      enum: ['Active', 'Diverting', 'Full', 'Standby'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

hospitalSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

export default mongoose.model('Hospital', hospitalSchema);
