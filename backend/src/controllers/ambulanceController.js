import Ambulance from '../models/Ambulance.js';
import Emergency from '../models/Emergency.js';
import { triggerPanicAlert } from '../services/alertEngine.js';

// @desc    Get all ambulances
// @route   GET /api/ambulances
export const getAmbulances = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const ambulances = await Ambulance.find(filter)
      .populate('assignedHospitalId', 'name code city location')
      .populate({
        path: 'activeEmergencyId',
        populate: [
          { path: 'patientId', select: 'name age gender bloodGroup chiefComplaint triageCategory' },
          { path: 'hospitalId', select: 'name code location emergencyContact' },
        ],
      })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: ambulances.length,
      data: ambulances,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single ambulance by ID
// @route   GET /api/ambulances/:id
export const getAmbulanceById = async (req, res, next) => {
  try {
    const ambulance = await Ambulance.findById(req.params.id)
      .populate('assignedHospitalId')
      .populate({
        path: 'activeEmergencyId',
        populate: [{ path: 'patientId' }, { path: 'hospitalId' }],
      });

    if (!ambulance) {
      return res.status(404).json({ success: false, message: 'Ambulance not found' });
    }

    res.json({
      success: true,
      data: ambulance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register a new ambulance
// @route   POST /api/ambulances
export const createAmbulance = async (req, res, next) => {
  try {
    const ambulance = await Ambulance.create(req.body);
    res.status(201).json({
      success: true,
      data: ambulance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update ambulance details / status
// @route   PUT /api/ambulances/:id
export const updateAmbulance = async (req, res, next) => {
  try {
    const ambulance = await Ambulance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!ambulance) {
      return res.status(404).json({ success: false, message: 'Ambulance not found' });
    }

    res.json({
      success: true,
      data: ambulance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Trigger Emergency SOS from Ambulance UI
// @route   POST /api/ambulances/:id/sos
export const triggerAmbulanceSOS = async (req, res, next) => {
  try {
    const ambulance = await Ambulance.findById(req.params.id);
    if (!ambulance) {
      return res.status(404).json({ success: false, message: 'Ambulance not found' });
    }

    ambulance.status = 'Emergency';
    await ambulance.save();

    const emergency = await Emergency.findById(ambulance.activeEmergencyId);

    const alert = await triggerPanicAlert({
      emergencyId: emergency?._id,
      ambulanceId: ambulance._id,
      hospitalId: emergency?.hospitalId,
      source: 'MANUAL_SOS',
    });

    res.json({
      success: true,
      message: 'Emergency SOS triggered successfully',
      data: alert,
    });
  } catch (err) {
    next(err);
  }
};
