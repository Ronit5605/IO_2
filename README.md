# IoT-Based Smart Ambulance and Emergency Communication System (SmartPulse IoT)

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-emerald.svg)](https://www.mongodb.com/)
[![MQTT](https://img.shields.io/badge/MQTT-Aedes%201883-orange.svg)](https://mqtt.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black.svg)](https://socket.io/)
[![ESP32](https://img.shields.io/badge/ESP32-Embedded%20C%2B%2B-red.svg)](https://www.espressif.com/)

An enterprise-grade, academic demonstration platform connecting smart ambulances, critical emergency patients, receiving hospitals, and central dispatch command centers. Built with a modular IoT hardware layer (ESP32, MAX30102, DS18B20, NEO-6M GPS), embedded Aedes MQTT broker, Node.js/Express backend with MongoDB, and an interactive React + Tailwind CSS frontend featuring Leaflet live mapping and Recharts telemetry graphs.

---

## 1. Project Introduction & Problem Statement

### The Problem
In prehospital emergency medical care, the "Golden Hour" represents the critical window where prompt definitive treatment can prevent mortality in conditions like STEMI (cardiac arrest), acute trauma, and stroke. Traditional emergency transport suffers from major communication gaps:
1. **Zero Prehospital Visibility:** Hospital emergency departments have no real-time insight into incoming patient vital signs before arrival.
2. **Delayed Preparation:** Critical facilities such as catheterization labs, CT scanners, operating rooms, and trauma teams are mobilized only after the ambulance physically arrives.
3. **Inaccurate Transit Times:** Hospital staff lack live GPS tracking and rely on verbal telephone estimates prone to urban traffic delays.

### The Objective
To design and implement a smart emergency healthcare management and telemetry platform that:
- Captures continuous patient vital signs (Heart Rate, SpO2, Body Temperature) inside the ambulance.
- Broadcasts real-time biomedical telemetry to receiving hospital trauma teams via low-latency WebSockets.
- Tracks ambulance GPS coordinates on an interactive Leaflet map with algorithmic Estimated Arrival Time (ETA) calculations.
- Dispatches instantaneous visual/audible alerts when vitals exceed demonstration safety thresholds.
- Facilitates a closed-loop emergency workflow where hospitals acknowledge incoming ambulances and update preparation checklists (beds, trauma doctors, blood bank).
- Functions turn-key with or without physical ESP32 hardware using a high-fidelity built-in IoT simulation engine.

---

## 2. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, React Router v6, Lucide React Icons, Recharts, Leaflet & React-Leaflet, Socket.IO Client |
| **Backend** | Node.js, Express.js 4, Mongoose 8, Socket.IO 4, JWT Authentication, bcryptjs, Express Rate Limiter, CORS |
| **Database** | MongoDB 8.0 with Mongoose ODM (Data persistence, automatic seeders, multi-index queries) |
| **IoT & Telemetry** | ESP32 WROOM-32 (C++ Arduino), MAX30102 Pulse Oximeter, DS18B20 OneWire Temp, NEO-6M UART GPS, Hardware Interrupt SOS Button, Embedded Aedes MQTT Broker (Port 1883) |
| **Simulation** | Built-in continuous telemetry & GPS waypoints simulator + Standalone Node.js MQTT simulator |

---

## 3. Project Folder Structure

```
c:\Users\ronit\Downloads\mini_sample\Japan\IOT_2\
├── backend/
│   ├── data/db/                    # Local MongoDB data directory
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection with local spawn fallback
│   │   ├── controllers/            # Express controllers (auth, amb, hosp, emg, vitals, alerts, etc.)
│   │   ├── middleware/             # JWT auth, RBAC authorization, rate limiting, error handler
│   │   ├── models/                 # 9 Mongoose models (User, Ambulance, Hospital, Patient, etc.)
│   │   ├── routes/                 # Express REST route endpoints
│   │   ├── services/
│   │   │   ├── alertEngine.js      # Threshold anomaly detection and debouncing
│   │   │   ├── geoService.js       # Haversine distance & ETA calculation
│   │   │   ├── mqttService.js      # Embedded Aedes MQTT broker & telemetry parser
│   │   │   ├── simulationService.js# Built-in background IoT & GPS simulator
│   │   │   └── socketService.js    # Socket.IO room management and broadcasts
│   │   ├── utils/
│   │   │   └── seedData.js         # Comprehensive academic demo seeder
│   │   └── server.js               # Backend main entrypoint
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI (Navbar, Sidebar, VitalCard, LiveMap, etc.)
│   │   ├── context/                # AuthContext, SocketContext
│   │   ├── pages/                  # 10 pages (Ambulance, Hospital, Admin, Monitoring, etc.)
│   │   ├── services/               # api.js, socket.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── iot/
│   ├── esp32_firmware/
│   │   ├── smart_ambulance_node.ino# Complete C++ Arduino sketch for ESP32
│   │   ├── config.h                # Hardware pins, Wi-Fi credentials, MQTT topics
│   │   └── README.md               # Pinout and flashing guide
│   └── simulator/
│       ├── iot_simulator.js        # Standalone MQTT simulator script
│       └── package.json
├── docs/
│   ├── ARCHITECTURE.md             # System architecture diagram (Mermaid)
│   ├── ER_DIAGRAM.md               # Database ER diagram & schema dictionary
│   ├── DATA_FLOW.md                # Sequence diagram & event mapping
│   ├── HARDWARE_WIRING.md          # Wiring schematics & pinouts
│   ├── API_DOCUMENTATION.md        # REST API endpoints & payload specifications
│   └── COLLEGE_PRESENTATION_GUIDE.md# 5-minute live demo guide & Viva Q&A
├── package.json                    # Root orchestration scripts
└── README.md                       # Master project documentation
```

---

## 4. Hardware Requirements & Wiring Map

### Hardware Components
1. **ESP32 Microcontroller:** NodeMCU-32S / ESP32 DevKit v1.
2. **MAX30102 Sensor:** High-sensitivity optical pulse oximetry and heart-rate sensor.
3. **DS18B20 Sensor:** Waterproof core body temperature probe (requires 4.7kΩ pullup resistor).
4. **NEO-6M GPS Module:** GPS receiver with ceramic patch antenna.
5. **Emergency Push Button:** Normally open tactile button.
6. **LEDs & Resistors:** Red SOS LED (220Ω), Blue/Green Wi-Fi indicator LED (220Ω).
7. **Power Source:** 5V 2A DC supply or LM2596 vehicle 12V-to-5V step-down regulator.

### Wiring Map
| Sensor / Component | Sensor Pin | ESP32 GPIO Pin | Protocol | Notes |
|---|---|---|---|---|
| **MAX30102** | SDA, SCL, VCC, GND | GPIO 21, GPIO 22, 3V3, GND | I2C | Standard Wire I2C bus |
| **DS18B20** | Data, VCC, GND | GPIO 4, 3V3/5V, GND | OneWire | **4.7kΩ resistor between Data and VCC** |
| **NEO-6M GPS**| TX, RX, VCC, GND | GPIO 16 (RX2), GPIO 17 (TX2), 5V, GND | UART2 | 9600 baud rate |
| **SOS Button** | Terminal 1, 2 | GPIO 15, GND | Digital Input | Internal `INPUT_PULLUP` enabled |
| **SOS LED** | Anode, Cathode | GPIO 2, GND | Digital Output | Active HIGH on alarm |

*(Detailed schematics available in [`docs/HARDWARE_WIRING.md`](docs/HARDWARE_WIRING.md))*

---

## 5. Software Requirements & Setup

- **Node.js:** v18.x, v20.x, or v22.x
- **npm:** v9.x or v10+
- **MongoDB:** v7.0 or v8.0 (Automatically spawned or connects to local mongod)
- **Arduino IDE:** v2.x (with ESP32 board support package)

### Environment Configuration
The backend loads variables from `backend/.env`. A pre-configured file is provided:
```env
PORT=5050
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/smart_ambulance
JWT_SECRET=super_secret_jwt_key_smart_ambulance_2026_academics
JWT_EXPIRES_IN=7d
MQTT_PORT=1883
CORS_ORIGIN=http://localhost:5173
ALERT_HR_MIN=60
ALERT_HR_MAX=100
ALERT_SPO2_MIN=94
ALERT_TEMP_MAX=38.0
```

---

## 6. How to Run the Application

### Step 1: Start MongoDB
Ensure MongoDB is running on port 27017 (or let the backend auto-spawn it from `backend/data/db`):
```bash
# Optional manual start if not already running as a service
& "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath backend\data\db --port 27017
```

### Step 2: Start the Backend Server
In a terminal window:
```bash
cd backend
npm start
```
*The backend will automatically:*
- Connect to MongoDB at `mongodb://127.0.0.1:27017/smart_ambulance`
- Seed initial demo ambulances, hospitals, patients, and accounts if needed.
- Start the embedded Aedes MQTT broker on port `1883`.
- Start the HTTP & Socket.IO server on `http://localhost:5050`.
- Launch the background IoT telemetry & GPS waypoint simulation loop.

### Step 3: Start the Frontend Application
In a separate terminal window:
```bash
cd frontend
npm run dev
```
Open your browser and navigate to:
👉 **`http://localhost:5173`**

### Step 4: Optional Standalone IoT Simulator
If you want to run an independent MQTT simulator outside the backend:
```bash
cd iot/simulator
npm start
```

---

## 7. Demo Accounts & One-Click Login Personas

The login page contains a **One-Click Academic Demo Sign-In** panel allowing instantaneous login without typing passwords:

| Persona | Role | Email | Password | Assigned Vehicle / Hospital |
|---|---|---|---|---|
| **Paramedic AMB-01** | `paramedic` | `paramedic1@smartpulse.io` | `Paramedic@1234` | Ambulance GJ-05-EM-1081 |
| **Apollo ER Staff** | `hospital_staff` | `apollo@smartpulse.io` | `Hospital@1234` | Apollo Speciality Hospital |
| **Civil ER Staff** | `hospital_staff` | `civil@smartpulse.io` | `Hospital@1234` | Civil Hospital Emergency Wing |
| **System Dispatcher** | `admin` | `admin@smartpulse.io` | `Admin@1234` | Central Command Center |

---

## 8. Emergency Communication Workflow

1. **Patient Intake & Dispatch:** Paramedic enters patient demographics and selects destination hospital in the Ambulance Dashboard.
2. **Telemetry Streaming:** Patient vitals and GPS coordinates begin streaming at 2-3 second intervals via MQTT / WebSockets.
3. **Hospital Notification:** Receiving hospital ER portal receives an audible and visual notification showing patient triage priority, biometrics, and estimated transit time (ETA).
4. **Hospital Acknowledgment:** ER team reviews vitals, reserves an emergency bay, assigns a doctor, alerts the trauma team, and clicks **"Acknowledge & Prepare ER"**.
5. **Real-Time Paramedic Confirmation:** Ambulance dashboard instantly displays green confirmation that the hospital is prepared and bay is assigned.
6. **Threshold Anomaly Alarm:** If vitals cross demonstration limits (e.g., BPM > 100 or SpO2 < 94%), a critical alert modal triggers synchronously across all dashboards.
7. **Hospital Admission:** Upon arrival, the case is marked as **"Admitted"**, saving handoff notes and resetting the ambulance to **Available**.

---

## 9. Completed Feature List

- [x] **Ambulance Dashboard:** Vehicle status toggle, live biometrics cards, real-time Recharts line graph, Leaflet map with moving GPS marker, emergency SOS panic button, patient entry form, destination hospital selector, and real-time hospital acknowledgment feed.
- [x] **Hospital ER Dashboard:** Incoming queue with triage priorities, real-time vital-sign streaming, live route approach map with dynamic ETA, 1-click trauma preparation checklist acknowledgment, and patient admission workflow.
- [x] **Admin Command Dashboard:** High-level KPIs, ambulance fleet monitoring table, registered hospital network cards, user management overview, activity audit logs, and alert distribution.
- [x] **Dedicated Telemetry Page:** Full-screen biomedical waveforms, configurable demonstration thresholds, and prehospital vitals history table.
- [x] **Live GPS Tracking Page:** Fullscreen interactive Leaflet map tracking multiple vehicles and hospitals simultaneously with speed and coordinate telemetry.
- [x] **IoT Hardware Integration:** Production-ready Arduino ESP32 firmware with MAX30102, DS18B20 OneWire, NEO-6M GPS, hardware interrupt SOS button, and JSON formatting.
- [x] **Embedded Aedes MQTT Broker:** Pure Node.js embedded broker on port 1883 bridging physical microcontrollers directly to MongoDB and WebSockets without third-party brokers.
- [x] **Simulation Control Toolbar:** Interactive toolbar to inject demonstration scenarios with 1 click: Normal, Tachycardia (>130 BPM), Hypoxia (<90%), High Fever (>39.5°C), or SOS Panic.
- [x] **Comprehensive Documentation:** System architecture, database ER diagram, prehospital data flow diagram, circuit schematics, and viva presentation guide.

---

## 10. Known Limitations & Academic Disclaimers

1. **Demonstration Thresholds:** The biomedical parameters configured in the software are intended exclusively for academic simulation and defense. They do not constitute certified clinical diagnostic criteria.
2. **Simulation Coordinates:** GPS simulation routes are pre-mapped for urban road corridors. In physical deployment, the NEO-6M GPS antenna requires an unobstructed view of the sky to acquire satellite lock.
3. **Network Latency:** Demonstration WebSockets operate over local loopback (`localhost`). In cellular vehicle installations, latency varies according to 4G/LTE mobile network coverage.

---

## 11. Future Enhancements

- In-ambulance computer-vision pupil dilation and facial stroke analysis.
- Smart Traffic Light Preemption (STLP) integration to dynamically trigger green corridors along the ambulance route.
- Direct HL7 / FHIR protocol interoperability with hospital electronic medical record (EMR) systems like Epic and Cerner.
- AI-driven cardiac arrhythmia classification (ECG QRS complex anomaly detection via edge TinyML on ESP32).
