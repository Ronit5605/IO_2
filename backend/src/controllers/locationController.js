import LocationHistory from '../models/LocationHistory.js';
import Ambulance from '../models/Ambulance.js';
import Emergency from '../models/Emergency.js';
import { calculateDistanceKm, calculateETA } from '../services/geoService.js';
import { emitLocationUpdate } from '../services/socketService.js';

// @desc    Post ambulance GPS location update
// @route   POST /api/locations
export const createLocation = async (req, res, next) => {
  try {
    const { ambulanceId, latitude, longitude, speed = 0, heading = 0 } = req.body;

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({ success: false, message: 'Ambulance not found' });
    }

    ambulance.currentLocation = {
      latitude,
      longitude,
      speed,
      heading,
      updatedAt: new Date(),
    };
    ambulance.iotDevice.lastHeartbeat = new Date();
    await ambulance.save();

    let emergencyDoc = null;
    let distanceKm = 0;
    let etaMinutes = 0;

    if (ambulance.activeEmergencyId) {
      emergencyDoc = await Emergency.findById(ambulance.activeEmergencyId);
      if (emergencyDoc) {
        distanceKm = calculateDistanceKm(
          latitude,
          longitude,
          emergencyDoc.destinationHospital.latitude,
          emergencyDoc.destinationHospital.longitude
        );
        etaMinutes = calculateETA(distanceKm, speed);

        emergencyDoc.currentLocation = {
          latitude,
          longitude,
          speed,
          heading,
          updatedAt: new Date(),
        };
        emergencyDoc.distanceRemainingKm = distanceKm;
        emergencyDoc.etaMinutes = etaMinutes;
        await emergencyDoc.save();
      }
    }

    const locHistory = await LocationHistory.create({
      ambulanceId: ambulance._id,
      emergencyId: emergencyDoc?._id,
      latitude,
      longitude,
      speed,
      heading,
      timestamp: new Date(),
    });

    emitLocationUpdate({
      ambulanceId: ambulance._id,
      emergencyId: emergencyDoc?._id,
      hospitalId: emergencyDoc?.hospitalId,
      vehicleNumber: ambulance.vehicleNumber,
      callSign: ambulance.callSign,
      location: {
        latitude,
        longitude,
        speed,
        heading,
        distanceKm,
        etaMinutes,
        updatedAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      data: locHistory,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get location history for an ambulance
// @route   GET /api/locations/:ambulanceId
export const getLocationHistory = async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    const history = await LocationHistory.find({ ambulanceId: req.params.ambulanceId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      count: history.length,
      data: history.reverse(),
    });
  } catch (err) {
    next(err);
  }
};
