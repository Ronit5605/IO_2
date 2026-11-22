import mongoose from 'mongoose';

const ambulanceSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    callSign: {
      type: String,
      required: [true, 'Call sign is required'],
      trim: true,
    },
    model: {
      type: String,
      default: 'Mercedes-Benz Sprinter ICU Unit',
    },
    status: {
      type: String,
      enum: ['Available', 'On Duty', 'Emergency', 'Maintenance'],
      default: 'Available',
    },
    driverName: {
      type: String,
      default: 'John Doe',
    },
    paramedicName: {
      type: String,
      default: 'Jane Smith (EMT-P)',
    },
    assignedHospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
    activeEmergencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Emergency',
      default: null,
    },
    currentLocation: {
      latitude: {
        type: Number,
        required: true,
        default: 21.1702,
      },
      longitude: {
        type: Number,
        required: true,
        default: 72.8311,
      },
      speed: {
        type: Number,
        default: 0, // km/h
      },
      heading: {
        type: Number,
        default: 0, // degrees
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    iotDevice: {
      deviceId: {
        type: String,
        default: 'ESP32-AMB-01',
      },
      status: {
        type: String,
        enum: ['Online', 'Offline', 'Connecting', 'Degraded'],
        default: 'Online',
      },
      batteryLevel: {
        type: Number,
        default: 95,
      },
      signalStrength: {
        type: Number,
        default: -65, // dBm
      },
      sensors: {
        max30102: { type: Boolean, default: true },
        ds18b20: { type: Boolean, default: true },
        gps: { type: Boolean, default: true },
        emergencyButton: { type: Boolean, default: true },
      },
      lastHeartbeat: {
        type: Date,
        default: Date.now,
      },
    },
    equipment: [
      {
        name: String,
        status: { type: String, enum: ['Ready', 'In Use', 'Depleted'], default: 'Ready' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

ambulanceSchema.index({ 'currentLocation.latitude': 1, 'currentLocation.longitude': 1 });
ambulanceSchema.index({ status: 1 });

export default mongoose.model('Ambulance', ambulanceSchema);
