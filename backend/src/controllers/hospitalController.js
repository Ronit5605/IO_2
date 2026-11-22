import Hospital from '../models/Hospital.js';
import Emergency from '../models/Emergency.js';

// @desc    Get all hospitals
// @route   GET /api/hospitals
export const getHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.find().sort({ name: 1 });

    // Enrich with count of incoming active emergencies
    const enriched = await Promise.all(
      hospitals.map(async (h) => {
        const incomingCount = await Emergency.countDocuments({
          hospitalId: h._id,
          status: { $in: ['Initiated', 'En Route', 'Hospital Acknowledged'] },
        });
        return {
          ...h.toObject(),
          incomingAmbulanceCount: incomingCount,
        };
      })
    );

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single hospital by ID
// @route   GET /api/hospitals/:id
export const getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Get all active incoming emergencies for this hospital
    const incomingEmergencies = await Emergency.find({
      hospitalId: hospital._id,
      status: { $in: ['Initiated', 'En Route', 'Hospital Acknowledged', 'Arrived'] },
    })
      .populate('ambulanceId')
      .populate('patientId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        hospital,
        incomingEmergencies,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new hospital
// @route   POST /api/hospitals
export const createHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({
      success: true,
      data: hospital,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update hospital readiness status
// @route   PUT /api/hospitals/:id/readiness
export const updateHospitalReadiness = async (req, res, next) => {
  try {
    const { availableBeds, icuBedsAvailable, readinessStatus, status } = req.body;

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    if (availableBeds !== undefined) hospital.availableBeds = availableBeds;
    if (icuBedsAvailable !== undefined) hospital.icuBedsAvailable = icuBedsAvailable;
    if (status !== undefined) hospital.status = status;
    if (readinessStatus) {
      hospital.readinessStatus = {
        ...hospital.readinessStatus,
        ...readinessStatus,
      };
    }

    await hospital.save();

    res.json({
      success: true,
      message: 'Hospital readiness updated successfully',
      data: hospital,
    });
  } catch (err) {
    next(err);
  }
};
