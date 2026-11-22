import Emergency from '../models/Emergency.js';
import Ambulance from '../models/Ambulance.js';
import Hospital from '../models/Hospital.js';
import Patient from '../models/Patient.js';
import Notification from '../models/Notification.js';
import { emitEmergencyCreated, emitEmergencyAcknowledged } from '../services/socketService.js';
import { calculateDistanceKm, calculateETA } from '../services/geoService.js';

// @desc    Create a new emergency case
// @route   POST /api/emergencies
export const createEmergency = async (req, res, next) => {
  try {
    const {
      ambulanceId,
      hospitalId,
      patientId,
      patientData, // Optional inline patient creation
      emergencyType,
      severity,
      pickupLocation,
    } = req.body;

    // 1. Resolve or Create Patient
    let resolvedPatientId = patientId;
    if (!resolvedPatientId && patientData) {
      const newPatient = await Patient.create({
        patientId: 'PAT-' + Math.floor(1000 + Math.random() * 9000),
        name: patientData.name || 'John Doe',
        age: patientData.age || 45,
        gender: patientData.gender || 'Male',
        bloodGroup: patientData.bloodGroup || 'O+',
        chiefComplaint: patientData.chiefComplaint || emergencyType || 'Cardiac Arrest',
        triageCategory: severity === 'Critical' ? 'Red (Immediate)' : 'Yellow (Delayed)',
        allergies: patientData.allergies || [],
        medicalHistory: patientData.medicalHistory || [],
        emergencyContact: patientData.emergencyContact,
      });
      resolvedPatientId = newPatient._id;
    }

    // 2. Fetch Ambulance & Hospital
    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({ success: false, message: 'Ambulance not found' });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // 3. Compute Initial Distance & ETA
    const ambLat = ambulance.currentLocation.latitude;
    const ambLng = ambulance.currentLocation.longitude;
    const hospLat = hospital.location.latitude;
    const hospLng = hospital.location.longitude;

    const distanceKm = calculateDistanceKm(ambLat, ambLng, hospLat, hospLng);
    const etaMinutes = calculateETA(distanceKm, 45);

    const caseNumber = `EMG-${Date.now().toString().slice(-6)}`;

    // 4. Create Emergency Case
    const emergency = await Emergency.create({
      caseNumber,
      ambulanceId: ambulance._id,
      hospitalId: hospital._id,
      patientId: resolvedPatientId,
      createdById: req.user?._id || null,
      status: 'En Route',
      severity: severity || 'Critical',
      emergencyType: emergencyType || 'Cardiac Arrest',
      pickupLocation: pickupLocation || {
        address: 'Emergency Site',
        latitude: ambLat,
        longitude: ambLng,
      },
      destinationHospital: {
        name: hospital.name,
        latitude: hospLat,
        longitude: hospLng,
      },
      currentLocation: {
        latitude: ambLat,
        longitude: ambLng,
        speed: 45,
        heading: 0,
        updatedAt: new Date(),
      },
      distanceRemainingKm: distanceKm,
      etaMinutes: etaMinutes,
    });

    // 5. Update Ambulance status and active emergency link
    ambulance.status = 'Emergency';
    ambulance.activeEmergencyId = emergency._id;
    ambulance.assignedHospitalId = hospital._id;
    await ambulance.save();

    // 6. Create Hospital Notification
    await Notification.create({
      recipientRole: 'hospital_staff',
      recipientHospitalId: hospital._id,
      recipientAmbulanceId: ambulance._id,
      title: `INCOMING EMERGENCY: ${emergencyType || 'Critical Patient'}`,
      message: `Ambulance ${ambulance.callSign} is en route with a ${severity || 'Critical'} patient. ETA: ${etaMinutes} mins.`,
      type: 'emergency_created',
      data: {
        emergencyId: emergency._id,
        ambulanceId: ambulance._id,
        patientId: resolvedPatientId,
        etaMinutes,
      },
    });

    const populatedEmergency = await Emergency.findById(emergency._id)
      .populate('ambulanceId')
      .populate('hospitalId')
      .populate('patientId');

    // 7. Real-Time Broadcast via Socket.IO
    emitEmergencyCreated(populatedEmergency);

    res.status(201).json({
      success: true,
      message: 'Emergency case created and hospital notified successfully',
      data: populatedEmergency,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all emergency cases
// @route   GET /api/emergencies
export const getEmergencies = async (req, res, next) => {
  try {
    const { status, hospitalId, ambulanceId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (hospitalId) filter.hospitalId = hospitalId;
    if (ambulanceId) filter.ambulanceId = ambulanceId;

    const emergencies = await Emergency.find(filter)
      .populate('ambulanceId')
      .populate('hospitalId')
      .populate('patientId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: emergencies.length,
      data: emergencies,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single emergency by ID
// @route   GET /api/emergencies/:id
export const getEmergencyById = async (req, res, next) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('ambulanceId')
      .populate('hospitalId')
      .populate('patientId');

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency case not found' });
    }

    res.json({
      success: true,
      data: emergency,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update emergency status (e.g. Arrived, Admitted, Completed)
// @route   PUT /api/emergencies/:id/status
export const updateEmergencyStatus = async (req, res, next) => {
  try {
    const { status, outcome, handoffSummary } = req.body;

    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency case not found' });
    }

    emergency.status = status;

    if (['Completed', 'Admitted', 'Cancelled'].includes(status)) {
      emergency.completionDetails = {
        completedAt: new Date(),
        outcome: outcome || 'Patient admitted to emergency department',
        handoffSummary: handoffSummary || 'Paramedic handed patient over to trauma team.',
      };

      // Reset ambulance back to available
      await Ambulance.findByIdAndUpdate(emergency.ambulanceId, {
        status: 'Available',
        activeEmergencyId: null,
      });
    }

    await emergency.save();

    const updated = await Emergency.findById(emergency._id)
      .populate('ambulanceId')
      .populate('hospitalId')
      .populate('patientId');

    emitEmergencyAcknowledged(updated);

    res.json({
      success: true,
      message: `Emergency status updated to ${status}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Hospital acknowledges incoming emergency and updates preparation status
// @route   PUT /api/emergencies/:id/acknowledge
export const acknowledgeEmergency = async (req, res, next) => {
  try {
    const { assignedBay, assignedDoctor, readinessChecklist, responseNotes } = req.body;

    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency case not found' });
    }

    emergency.status = 'Hospital Acknowledged';
    emergency.hospitalAcknowledgment = {
      isAcknowledged: true,
      acknowledgedAt: new Date(),
      acknowledgedBy: req.user?._id || null,
      assignedBay: assignedBay || 'Trauma Bay 1',
      assignedDoctor: assignedDoctor || 'Dr. On Duty',
      readinessChecklist: readinessChecklist || {
        traumaTeamAlerted: true,
        bedReserved: true,
        bloodUnitsPrepared: true,
        ventilatorReady: true,
        otStandby: false,
      },
      responseNotes: responseNotes || 'ER team is ready for immediate reception.',
    };

    await emergency.save();

    // Create Notification for Ambulance paramedic
    await Notification.create({
      recipientRole: 'paramedic',
      recipientAmbulanceId: emergency.ambulanceId,
      title: 'HOSPITAL ACKNOWLEDGED EMERGENCY',
      message: `Hospital acknowledged patient reception. Assigned to ${emergency.hospitalAcknowledgment.assignedBay}.`,
      type: 'hospital_ack',
      data: { emergencyId: emergency._id, acknowledgment: emergency.hospitalAcknowledgment },
    });

    const updated = await Emergency.findById(emergency._id)
      .populate('ambulanceId')
      .populate('hospitalId')
      .populate('patientId');

    // Broadcast acknowledgment live to Ambulance dashboard!
    emitEmergencyAcknowledged(updated);

    res.json({
      success: true,
      message: 'Emergency acknowledged and readiness broadcasted to ambulance',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
