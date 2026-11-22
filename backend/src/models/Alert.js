import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
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
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
    alertType: {
      type: String,
      enum: ['HEART_RATE_CRITICAL', 'SPO2_CRITICAL', 'HIGH_FEVER', 'EMERGENCY_BUTTON', 'MANUAL_SOS', 'COMM_FAILURE'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['critical', 'warning', 'info'],
      default: 'critical',
    },
    parameter: {
      type: String,
      required: true, // e.g., 'Heart Rate', 'SpO2', 'Body Temperature', 'Panic Button'
    },
    value: {
      type: Number,
      default: null,
    },
    threshold: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: true,
    },
    isAcknowledged: {
      type: Boolean,
      default: false,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ hospitalId: 1, isAcknowledged: 1, createdAt: -1 });
alertSchema.index({ ambulanceId: 1, createdAt: -1 });

export default mongoose.model('Alert', alertSchema);
