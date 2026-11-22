# System Architecture & Technical Specifications

**Project:** IoT-Based Smart Ambulance and Emergency Communication System  
**Platform Code Name:** SmartPulse IoT  

---

## 1. High-Level System Architecture Diagram

```mermaid
flowchart TB
    subgraph IoT_Hardware_Layer["1. IoT Edge Telemetry Layer (Ambulance Vehicle)"]
        ESP32["ESP32 Microcontroller (WROOM-32)"]
        MAX["MAX30102 Optical Sensor<br/>(Heart Rate BPM & SpO2 %)"]
        DS["DS18B20 OneWire Sensor<br/>(Core Body Temp °C)"]
        GPS["NEO-6M GPS Module<br/>(Lat, Lng, Speed, Bearing)"]
        SOS["Hardware Interrupt SOS Button<br/>(GPIO 15 Active-LOW)"]

        MAX -->|I2C: GPIO 21/22| ESP32
        DS -->|OneWire: GPIO 4| ESP32
        GPS -->|UART Serial2: GPIO 16/17| ESP32
        SOS -->|External Interrupt| ESP32
    end

    subgraph Communication_Layer["2. Telemetry & Ingestion Gateway"]
        MQTT_BROKER["Embedded Aedes MQTT Broker<br/>(Port 1883 / TLS)"]
        SIM_ENGINE["Internal Dynamic IoT Simulator<br/>(Realistic Waypoints & Fluctuations)"]
    end

    ESP32 -->|JSON over MQTT: ambulance/telemetry| MQTT_BROKER
    SIM_ENGINE -->|MQTT Telemetry Injection| MQTT_BROKER

    subgraph Backend_Core["3. Backend Application Core (Node.js & Express)"]
        REST_API["Express REST API Engine<br/>(Port 5050)"]
        ALERT_ENGINE["Rule-Based Alert Engine<br/>(Configurable Anomaly Limits)"]
        GEO_ENGINE["GeoService & Haversine Router<br/>(Dynamic ETA & Remaining Km)"]
        SOCKET_IO["Socket.IO Real-Time Dispatcher<br/>(Rooms: ambulance_id, hospital_id, admin)"]

        MQTT_BROKER --> ALERT_ENGINE
        MQTT_BROKER --> GEO_ENGINE
        ALERT_ENGINE --> SOCKET_IO
        GEO_ENGINE --> SOCKET_IO
        REST_API <--> SOCKET_IO
    end

    subgraph Database_Layer["4. Persistent Storage (MongoDB Database)"]
        MONGO[("MongoDB 8.0 Cluster<br/>smart_ambulance Database")]
        M_AMB["Ambulance Collection"]
        M_HOSP["Hospital Collection"]
        M_PAT["Patient Records"]
        M_EMG["Emergency Cases"]
        M_VIT["Vital Readings Telemetry"]
        M_ALT["Alerts & SOS Incidents"]
        M_LOC["Location History (GPS Audit)"]
        M_NOT["Notifications & Broadcasts"]
        M_USR["User Accounts (RBAC)"]

        MONGO --- M_AMB
        MONGO --- M_HOSP
        MONGO --- M_PAT
        MONGO --- M_EMG
        MONGO --- M_VIT
        MONGO --- M_ALT
        MONGO --- M_LOC
        MONGO --- M_NOT
        MONGO --- M_USR

        REST_API <--> MONGO
        ALERT_ENGINE --> M_ALT
        MQTT_BROKER --> M_VIT
        MQTT_BROKER --> M_LOC
    end

    subgraph Frontend_Portals["5. Client Presentation Layer (React 18 + Vite + Tailwind CSS)"]
        AMB_DASH["Ambulance Paramedic Dashboard<br/>- Vitals Gauges & ECG Sparklines<br/>- Emergency Case Entry<br/>- 1-Click SOS Beacon<br/>- Hospital Acknowledgment Monitor"]
        HOSP_DASH["Hospital ER Command Portal<br/>- Incoming Patient Queue<br/>- Streaming Biometrics<br/>- Leaflet Live Approach Map & ETA<br/>- 1-Click Trauma Preparation Ack"]
        ADMIN_DASH["Central Dispatcher Portal<br/>- Fleet GPS Tracking<br/>- Hospital Readiness Overview<br/>- Anomaly Incident Audit Logs<br/>- Telemetry Analytics"]

        SOCKET_IO <==>|WebSocket Event Stream| AMB_DASH
        SOCKET_IO <==>|WebSocket Event Stream| HOSP_DASH
        SOCKET_IO <==>|WebSocket Event Stream| ADMIN_DASH

        AMB_DASH <-->|JWT Authenticated REST| REST_API
        HOSP_DASH <-->|JWT Authenticated REST| REST_API
        ADMIN_DASH <-->|JWT Authenticated REST| REST_API
    end
```

---

## 2. Component Design & Modularity

### A. IoT Edge & Microcontroller Subsystem
- **Decoupled Architecture:** The physical hardware connects to the backend exclusively using standard MQTT topics (`ambulance/telemetry`). The backend does not depend on physical hardware presence; if hardware is disconnected, the embedded simulation service generates equivalent payloads with identical schema keys, preventing frontend breakage.
- **Payload Schema:**
  ```json
  {
    "ambulanceId": "GJ-05-EM-1081",
    "patientId": "PAT-4011",
    "heartRate": 84,
    "spo2": 98,
    "temperature": 36.8,
    "latitude": 21.1730,
    "longitude": 72.8235,
    "speed": 48.0,
    "emergency": false,
    "hardware": true,
    "timestamp": 1774167000
  }
  ```

### B. Ingestion & Communication Layer
- **Aedes MQTT Broker:** Embedded directly into the Node.js application process, eliminating the operational overhead of installing Mosquitto or maintaining cloud broker credentials.
- **Socket.IO Real-Time Dispatcher:** Implements targeted pub/sub rooms (`ambulance_<id>`, `hospital_<id>`, `emergency_<id>`, `admin`) so hospital ER staff only receive biometrics for patients directed to their specific trauma unit.

### C. Backend Engine & Processing
- **Alert Engine:** Compares continuous biometrics against demonstration thresholds:
  - Tachycardia: Heart rate > 100 BPM (Critical: > 120 BPM)
  - Bradycardia: Heart rate < 60 BPM (Critical: < 45 BPM)
  - Hypoxemia: SpO2 < 94% (Critical: < 90%)
  - Hyperthermia / High Fever: Core temperature > 38.0°C (Critical: > 39.5°C)
  - Panic SOS: Hardware push button or manual software dispatch.
- **GeoService & Transit Calculator:** Implements the Haversine trigonometric formula to calculate distance between ambulance GPS coordinates and hospital destination, dynamically computing ETA with emergency vehicle transit adjustment factors.
