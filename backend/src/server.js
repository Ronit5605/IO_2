import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Config
import { connectDB } from './config/db.js';
import { initSocket } from './services/socketService.js';
import { initMQTTBroker } from './services/mqttService.js';
import { seedDatabase } from './utils/seedData.js';
import { startSimulation } from './services/simulationService.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import ambulanceRoutes from './routes/ambulanceRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import vitalRoutes from './routes/vitalRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Smart Ambulance Emergency Backend & IoT Gateway',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/stats', statsRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MQTT_PORT = process.env.MQTT_PORT || 1883;

const startServer = async () => {
  try {
    // 1. Connect Database (with automatic local / memory fallback)
    await connectDB();

    // 2. Auto-seed sample demo data if collection empty
    await seedDatabase();

    // 3. Initialize Embedded MQTT Broker for ESP32 & Simulator
    initMQTTBroker(Number(MQTT_PORT));

    // 4. Handle server errors gracefully
    httpServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ [Server Error] Port ${PORT} is already in use by another process.`);
        console.error(`👉 Run the following in PowerShell to free port ${PORT}:`);
        console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT} -ErrorAction SilentlyContinue).OwningProcess -Force\n`);
        process.exit(1);
      } else {
        console.error('[Server Error]', err);
        process.exit(1);
      }
    });

    // 5. Start HTTP Server
    httpServer.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚑 Smart Ambulance Emergency Platform Backend`);
      console.log(`📡 HTTP Server running on: http://localhost:${PORT}`);
      console.log(`🔌 Socket.IO enabled on: ws://localhost:${PORT}`);
      console.log(`⚡ MQTT Broker listening on port: ${MQTT_PORT}`);
      console.log(`====================================================`);
    });

    // 6. Start background IoT & GPS simulation with 3-second cycle
    startSimulation(3000);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
