# Emergency Communication Data Flow & Sequence Diagram

---

## 1. Complete Prehospital Emergency Workflow Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Paramedic as Paramedic (Ambulance AMB-01)
    participant IoTNode as ESP32 Sensor Node / Simulator
    participant Gateway as Backend Gateway (MQTT + REST)
    participant DB as MongoDB Database
    participant Socket as Socket.IO Real-Time Dispatcher
    actor Doctor as Emergency Staff (Hospital ER)
    actor Admin as Central Dispatcher (Admin Command)

    Note over Paramedic, Admin: PHASE 1: EMERGENCY DISPATCH & PATIENT INTAKE
    Paramedic->>Gateway: POST /api/emergencies (Patient info, destination hospital, triage severity)
    Gateway->>DB: Save Patient & Emergency record (Status: "En Route")
    Gateway->>DB: Update Ambulance status to "Emergency"
    Gateway->>Socket: emit("emergency_created", emergencyData)
    Socket-->>Doctor: Hospital Alert Notification (Audio & Visual Alert Banner)
    Socket-->>Admin: Central Fleet Alert Logged

    Note over Paramedic, Admin: PHASE 2: CONTINUOUS BIOMETRIC & GPS TELEMETRY
    loop Every 2 to 3 Seconds
        IoTNode->>Gateway: MQTT Publish "ambulance/telemetry" (HR, SpO2, Temp, Lat, Lng, Speed)
        Gateway->>Gateway: GeoService: Haversine distance & ETA calculation
        Gateway->>Gateway: AlertEngine: Check thresholds (HR: 60-100, SpO2: >=94%, Temp: <=38.0C)
        Gateway->>DB: Record in VitalReadings & LocationHistories
        Gateway->>Socket: emit("vital_update") & emit("location_update")
        Socket-->>Paramedic: Update Vitals Gauges & Leaflet Map
        Socket-->>Doctor: Update Streaming Telemetry & Approach Map with ETA
        Socket-->>Admin: Real-time Fleet Location updated
    end

    Note over Paramedic, Admin: PHASE 3: HOSPITAL PREPARATION & ACKNOWLEDGMENT
    Doctor->>Gateway: PUT /api/emergencies/:id/acknowledge (Bay 1, Doctor Assigned, Trauma Team Alerted)
    Gateway->>DB: Update Emergency (Status: "Hospital Acknowledged")
    Gateway->>DB: Save Notification for Ambulance
    Gateway->>Socket: emit("hospital_acknowledged", ackDetails)
    Socket-->>Paramedic: Green Acknowledgment Card displayed (Bay & Doctor confirmed)
    Socket-->>Admin: Audit log: Hospital confirmed readiness

    Note over Paramedic, Admin: PHASE 4: ANOMALY DETECTION / EMERGENCY SOS
    opt Critical Arrhythmia or Hardware Panic SOS Triggered
        IoTNode->>Gateway: MQTT Telemetry (HeartRate = 135 BPM OR SOS Button = true)
        Gateway->>Gateway: AlertEngine generates CRITICAL ALERT
        Gateway->>DB: Insert Alert into MongoDB (isAcknowledged: false)
        Gateway->>Socket: emit("critical_vital_alert", alertData)
        Socket-->>Doctor: Modal Broadcast: TACHYCARDIA ANOMALY DETECTED
        Socket-->>Paramedic: Audible Alert: Vital threshold exceeded
        Socket-->>Admin: High-priority incident logged in Command Center
        Doctor->>Gateway: PUT /api/alerts/:id/acknowledge
        Gateway->>DB: Update Alert (isAcknowledged: true)
    end

    Note over Paramedic, Admin: PHASE 5: HOSPITAL ARRIVAL & ADMISSION
    Paramedic->>Gateway: Ambulance arrives at hospital coordinates (ETA: 0m)
    Doctor->>Gateway: PUT /api/emergencies/:id/status (Status: "Admitted")
    Gateway->>DB: Complete Emergency Case & Record Handoff Summary
    Gateway->>DB: Reset Ambulance status to "Available"
    Gateway->>Socket: emit("emergency_updated", { status: "Admitted" })
    Socket-->>Paramedic: Shift reset to Available
    Socket-->>Doctor: Trauma bay cleared for next incoming patient
    Socket-->>Admin: Prehospital mission marked complete
```

---

## 2. Real-Time Socket.IO Channels & Event Mapping

| Event Name | Direction | Payload Description | Target Recipients |
|---|---|---|---|
| `join_ambulance` | Client -> Server | Ambulance ID | Joins vehicle-specific private room |
| `join_hospital` | Client -> Server | Hospital ID | Joins trauma center private room |
| `join_emergency`| Client -> Server | Emergency Case ID | Joins active incident monitoring channel |
| `join_admin` | Client -> Server | `null` | Joins global dispatcher command room |
| `vital_update` | Server -> Client | Latest `{ heartRate, spo2, temperature, isAbnormal }` | Paramedic, receiving Hospital, Admin |
| `location_update` | Server -> Client | Latest `{ latitude, longitude, speed, distanceKm, etaMinutes }` | Paramedic, receiving Hospital, Admin |
| `new_emergency_alert` | Server -> Client | Emergency Case with patient details | Assigned Hospital ER portal |
| `hospital_acknowledged`| Server -> Client | Readiness checklist, assigned bay, ER physician | Ambulance paramedic dashboard |
| `critical_vital_alert` | Server -> Client | Threshold anomaly / SOS details | Hospital, Ambulance, Admin modal popups |
