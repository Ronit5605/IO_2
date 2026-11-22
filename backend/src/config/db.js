import mongoose from 'mongoose';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import net from 'net';

let mongodProcess = null;

// Helper to check if a TCP port is open
const isPortOpen = (port = 27017, host = '127.0.0.1') => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_ambulance';

  const portListening = await isPortOpen(27017);

  if (!portListening) {
    const defaultMongoBin = 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';
    const dbPath = path.resolve('data/db');

    if (fs.existsSync(defaultMongoBin)) {
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      console.log(`[Database] Port 27017 is idle. Spawning local mongod daemon at ${dbPath}...`);
      mongodProcess = spawn(defaultMongoBin, ['--dbpath', dbPath, '--port', '27017', '--bind_ip', '127.0.0.1'], {
        detached: false,
        stdio: 'ignore',
      });

      // Wait 2 seconds for mongod initialization
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[Database] MongoDB connection error: ${err.message}`);
    console.error('[Database] Verify MongoDB daemon or run with BypassSandbox if running isolated.');
    throw err;
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodProcess) {
    mongodProcess.kill();
  }
};
