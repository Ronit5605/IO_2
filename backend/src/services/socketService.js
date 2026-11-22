import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for specific ambulance
    socket.on('join_ambulance', (ambulanceId) => {
      if (ambulanceId) {
        socket.join(`ambulance_${ambulanceId}`);
        console.log(`[Socket.IO] ${socket.id} joined ambulance_${ambulanceId}`);
      }
    });

    // Join room for specific hospital
    socket.on('join_hospital', (hospitalId) => {
      if (hospitalId) {
        socket.join(`hospital_${hospitalId}`);
        console.log(`[Socket.IO] ${socket.id} joined hospital_${hospitalId}`);
      }
    });

    // Join room for specific active emergency case
    socket.on('join_emergency', (emergencyId) => {
      if (emergencyId) {
        socket.join(`emergency_${emergencyId}`);
        console.log(`[Socket.IO] ${socket.id} joined emergency_${emergencyId}`);
      }
    });

    // Join admin broadcast room
    socket.on('join_admin', () => {
      socket.join('admin');
      console.log(`[Socket.IO] ${socket.id} joined admin room`);
    });

    // Emergency Panic Button pressed from client
    socket.on('trigger_sos', (data) => {
      console.warn(`[Socket.IO] EMERGENCY SOS TRIGGERED!`, data);
      io.emit('emergency_sos_broadcast', {
        timestamp: new Date().toISOString(),
        ...data,
      });
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket(httpServer) first.');
  }
  return io;
};

/**
 * Broadcast real-time vitals to everyone monitoring the emergency and hospital
 */
export const emitVitalUpdate = (data) => {
  if (!io) return;
  const { emergencyId, hospitalId, ambulanceId, vitals } = data;

  // Broadcast to specific emergency room
  if (emergencyId) {
    io.to(`emergency_${emergencyId}`).emit('vital_update', data);
  }
  // Broadcast to assigned hospital room
  if (hospitalId) {
    io.to(`hospital_${hospitalId}`).emit('vital_update', data);
  }
  // Broadcast to ambulance room
  if (ambulanceId) {
    io.to(`ambulance_${ambulanceId}`).emit('vital_update', data);
  }
  // Admin room always gets updates
  io.to('admin').emit('vital_update', data);

  // Global channel for general monitoring
  io.emit('global_vital_stream', data);
};

/**
 * Broadcast live GPS location updates
 */
export const emitLocationUpdate = (data) => {
  if (!io) return;
  const { ambulanceId, emergencyId, hospitalId, location } = data;

  if (emergencyId) {
    io.to(`emergency_${emergencyId}`).emit('location_update', data);
  }
  if (hospitalId) {
    io.to(`hospital_${hospitalId}`).emit('location_update', data);
  }
  if (ambulanceId) {
    io.to(`ambulance_${ambulanceId}`).emit('location_update', data);
  }
  io.to('admin').emit('location_update', data);
  io.emit('global_location_stream', data);
};

/**
 * Broadcast when an emergency case is initiated
 */
export const emitEmergencyCreated = (emergency) => {
  if (!io) return;
  const hospitalId = emergency.hospitalId?._id || emergency.hospitalId;
  const ambulanceId = emergency.ambulanceId?._id || emergency.ambulanceId;

  if (hospitalId) {
    io.to(`hospital_${hospitalId}`).emit('new_emergency_alert', emergency);
  }
  if (ambulanceId) {
    io.to(`ambulance_${ambulanceId}`).emit('emergency_status_changed', emergency);
  }
  io.to('admin').emit('new_emergency_alert', emergency);
  io.emit('emergency_created', emergency);
};

/**
 * Broadcast hospital acknowledgment and preparation status
 */
export const emitEmergencyAcknowledged = (emergency) => {
  if (!io) return;
  const ambulanceId = emergency.ambulanceId?._id || emergency.ambulanceId;
  const emergencyId = emergency._id;

  if (ambulanceId) {
    io.to(`ambulance_${ambulanceId}`).emit('hospital_acknowledged', emergency);
  }
  if (emergencyId) {
    io.to(`emergency_${emergencyId}`).emit('hospital_acknowledged', emergency);
  }
  io.to('admin').emit('hospital_acknowledged', emergency);
  io.emit('emergency_updated', emergency);
};

/**
 * Broadcast high priority vital or panic alert
 */
export const emitCriticalAlert = (alert) => {
  if (!io) return;
  const hospitalId = alert.hospitalId?._id || alert.hospitalId;
  const ambulanceId = alert.ambulanceId?._id || alert.ambulanceId;

  if (hospitalId) {
    io.to(`hospital_${hospitalId}`).emit('critical_vital_alert', alert);
  }
  if (ambulanceId) {
    io.to(`ambulance_${ambulanceId}`).emit('critical_vital_alert', alert);
  }
  io.to('admin').emit('critical_vital_alert', alert);
  io.emit('system_alert', alert);
};
