import Alert from '../models/Alert.js';

// @desc    Get all alerts (with optional hospital or emergency filters)
// @route   GET /api/alerts
export const getAlerts = async (req, res, next) => {
  try {
    const { hospitalId, emergencyId, isAcknowledged, severity } = req.query;
    const filter = {};

    if (hospitalId) filter.hospitalId = hospitalId;
    if (emergencyId) filter.emergencyId = emergencyId;
    if (isAcknowledged !== undefined) filter.isAcknowledged = isAcknowledged === 'true';
    if (severity) filter.severity = severity;

    const alerts = await Alert.find(filter)
      .populate('ambulanceId', 'vehicleNumber callSign driverName paramedicName')
      .populate('patientId', 'name age gender bloodGroup')
      .populate('hospitalId', 'name code')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Acknowledge an alert
// @route   PUT /api/alerts/:id/acknowledge
export const acknowledgeAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.isAcknowledged = true;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = req.user?._id || null;
    await alert.save();

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: alert,
    });
  } catch (err) {
    next(err);
  }
};
