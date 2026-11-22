import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ['all', 'admin', 'hospital_staff', 'paramedic'],
      default: 'all',
    },
    recipientHospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
    recipientAmbulanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ambulance',
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['emergency_created', 'vital_alert', 'hospital_ack', 'status_update', 'system_alert'],
      default: 'system_alert',
    },
    data: {
      emergencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Emergency' },
      ambulanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance' },
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
      alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert' },
      extra: mongoose.Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
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

notificationSchema.index({ recipientRole: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientHospitalId: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
