import Ambulance from '../models/Ambulance.js';
import Hospital from '../models/Hospital.js';
import Emergency from '../models/Emergency.js';
import Patient from '../models/Patient.js';
import Alert from '../models/Alert.js';
import User from '../models/User.js';

// @desc    Get system-wide overview statistics
// @route   GET /api/stats/overview
export const getOverviewStats = async (req, res, next) => {
  try {
    const [
      totalAmbulances,
      totalHospitals,
      activeEmergencies,
      totalPatients,
      totalAlerts,
      totalUsers,
      ambulancesByStatus,
      emergenciesBySeverity,
    ] = await Promise.all([
      Ambulance.countDocuments(),
      Hospital.countDocuments(),
      Emergency.countDocuments({ status: { $in: ['Initiated', 'En Route', 'Hospital Acknowledged'] } }),
      Patient.countDocuments(),
      Alert.countDocuments({ isAcknowledged: false }),
      User.countDocuments(),
      Ambulance.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Emergency.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalAmbulances,
        totalHospitals,
        activeEmergencies,
        totalPatients,
        unacknowledgedAlerts: totalAlerts,
        totalUsers,
        ambulancesByStatus: ambulancesByStatus.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        emergenciesBySeverity: emergenciesBySeverity.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get detailed audit logs & analytics
// @route   GET /api/stats/analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const recentAlerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('ambulanceId', 'callSign')
      .populate('hospitalId', 'name');

    const recentEmergencies = await Emergency.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('ambulanceId', 'callSign')
      .populate('hospitalId', 'name')
      .populate('patientId', 'name');

    res.json({
      success: true,
      data: {
        recentAlerts,
        recentEmergencies,
      },
    });
  } catch (err) {
    next(err);
  }
};
