import Patient from '../models/Patient.js';
import VitalReading from '../models/VitalReading.js';

// @desc    Register a new patient
// @route   POST /api/patients
export const createPatient = async (req, res, next) => {
  try {
    const { name, age, gender, bloodGroup, emergencyContact, allergies, medicalHistory, chiefComplaint, triageCategory, notes } = req.body;

    const patientId = 'PAT-' + Math.floor(1000 + Math.random() * 9000);

    const patient = await Patient.create({
      patientId,
      name,
      age,
      gender,
      bloodGroup: bloodGroup || 'Unknown',
      emergencyContact,
      allergies: allergies || [],
      medicalHistory: medicalHistory || [],
      chiefComplaint: chiefComplaint || 'Acute Emergency',
      triageCategory: triageCategory || 'Red (Immediate)',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      data: patient,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all patients
// @route   GET /api/patients
export const getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single patient by ID with latest vitals
// @route   GET /api/patients/:id
export const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const latestVitals = await VitalReading.find({ patientId: patient._id })
      .sort({ timestamp: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        patient,
        latestVitals,
      },
    });
  } catch (err) {
    next(err);
  }
};
