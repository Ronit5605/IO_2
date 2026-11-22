import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 130,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    allergies: [
      {
        type: String,
      },
    ],
    medicalHistory: [
      {
        type: String,
      },
    ],
    chiefComplaint: {
      type: String,
      default: 'Acute distress / trauma',
    },
    triageCategory: {
      type: String,
      enum: ['Red (Immediate)', 'Yellow (Delayed)', 'Green (Minor)', 'Black (Deceased)'],
      default: 'Red (Immediate)',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Patient', patientSchema);
