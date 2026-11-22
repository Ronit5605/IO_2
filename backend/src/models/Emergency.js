import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    ambulanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ambulance',
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Initiated', 'En Route', 'Hospital Acknowledged', 'Arrived', 'Admitted', 'Completed', 'Cancelled'],
      default: 'Initiated',
    },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Moderate', 'Stable'],
      default: 'Critical',
    },
    emergencyType: {
      type: String,
      enum: ['Cardiac Arrest', 'Respiratory Distress', 'Road Accident / Trauma', 'Stroke', 'Severe Burn', 'General Medical'],
      default: 'Cardiac Arrest',
    },
    pickupLocation: {
      address: { type: String, default: 'Civil Lines Road, Sector 4' },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    destinationHospital: {
      name: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    currentLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      speed: { type: Number, default: 0 },
      heading: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now },
    },
    etaMinutes: {
      type: Number,
      default: 12,
    },
    distanceRemainingKm: {
      type: Number,
      default: 4.8,
    },
    hospitalAcknowledgment: {
      isAcknowledged: { type: Boolean, default: false },
      acknowledgedAt: { type: Date, default: null },
      acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      assignedBay: { type: String, default: 'Resus Bay 1' },
      assignedDoctor: { type: String, default: 'Dr. Sarah Connor, Chief ER' },
      readinessChecklist: {
        traumaTeamAlerted: { type: Boolean, default: false },
        bedReserved: { type: Boolean, default: false },
        bloodUnitsPrepared: { type: Boolean, default: false },
        ventilatorReady: { type: Boolean, default: false },
        otStandby: { type: Boolean, default: false },
      },
      responseNotes: { type: String, default: '' },
    },
    completionDetails: {
      completedAt: { type: Date, default: null },
      outcome: { type: String, default: '' },
      handoffSummary: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

emergencySchema.index({ status: 1 });
emergencySchema.index({ ambulanceId: 1 });
emergencySchema.index({ hospitalId: 1 });

export default mongoose.model('Emergency', emergencySchema);
