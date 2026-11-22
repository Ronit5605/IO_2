import mongoose from 'mongoose';

const vitalReadingSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    emergencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Emergency',
      default: null,
    },
    ambulanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ambulance',
      required: true,
    },
    heartRate: {
      type: Number,
      required: true, // BPM
    },
    spo2: {
      type: Number,
      required: true, // percentage (e.g., 98)
    },
    temperature: {
      type: Number,
      required: true, // Celsius (e.g., 36.8)
    },
    bloodPressureSystolic: {
      type: Number,
      default: 120, // mmHg
    },
    bloodPressureDiastolic: {
      type: Number,
      default: 80, // mmHg
    },
    respiratoryRate: {
      type: Number,
      default: 16, // breaths/min
    },
    sensorStatus: {
      max30102: { type: String, enum: ['OK', 'DISCONNECTED', 'NOISY'], default: 'OK' },
      ds18b20: { type: String, enum: ['OK', 'DISCONNECTED'], default: 'OK' },
      hardwareState: { type: String, enum: ['REAL_HARDWARE', 'SIMULATED'], default: 'SIMULATED' },
    },
    isAbnormal: {
      type: Boolean,
      default: false,
    },
    abnormalParameters: [
      {
        parameter: String,
        value: Number,
        threshold: String,
        severity: String,
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

vitalReadingSchema.index({ patientId: 1, timestamp: -1 });
vitalReadingSchema.index({ emergencyId: 1, timestamp: -1 });
vitalReadingSchema.index({ ambulanceId: 1, timestamp: -1 });

export default mongoose.model('VitalReading', vitalReadingSchema);
