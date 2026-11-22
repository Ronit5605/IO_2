# SmartPulse REST API Specification

**Base URL:** `http://localhost:5050/api`  
**Authentication:** Standard JWT Bearer token via `Authorization: Bearer <TOKEN>` header.  
**Content-Type:** `application/json`  

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new staff account.
- **Request Body:**
  ```json
  {
    "name": "Paramedic Jane Doe",
    "email": "jane@smartpulse.io",
    "password": "Password@123",
    "role": "paramedic",
    "phone": "+91 98765 43210"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "id": "...", "name": "Jane Doe", "email": "...", "role": "paramedic" }
  }
  ```

### `POST /api/auth/login`
Authenticates credentials and returns signed JWT.
- **Request Body:**
  ```json
  { "email": "paramedic1@smartpulse.io", "password": "Paramedic@1234" }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "id": "...", "name": "Vikram Mehta", "role": "paramedic" }
  }
  ```

### `GET /api/auth/me`
Retrieves authenticated user profile (Requires Bearer token).

---

## 2. Ambulance Endpoints (`/api/ambulances`)

### `GET /api/ambulances`
Retrieves all registered ambulances with populated active emergencies and hospital assignments.

### `GET /api/ambulances/:id`
Retrieves single ambulance details by ID.

### `PUT /api/ambulances/:id`
Updates ambulance status or assigned details.
- **Request Body:**
  ```json
  { "status": "Emergency" }
  ```

### `POST /api/ambulances/:id/sos`
Triggers an immediate emergency panic SOS beacon from the vehicle.

---

## 3. Hospital Endpoints (`/api/hospitals`)

### `GET /api/hospitals`
Retrieves all emergency hospitals with active incoming ambulance counts.

### `GET /api/hospitals/:id`
Retrieves detailed hospital record including all incoming en route emergency cases.

### `PUT /api/hospitals/:id/readiness`
Updates available beds, ICU beds, and trauma readiness checklist.
- **Request Body:**
  ```json
  {
    "availableBeds": 16,
    "icuBedsAvailable": 4,
    "readinessStatus": {
      "traumaTeamOnStandby": true,
      "cathLabReady": true
    }
  }
  ```

---

## 4. Patient Endpoints (`/api/patients`)

### `POST /api/patients`
Registers an emergency patient intake record.
- **Request Body:**
  ```json
  {
    "name": "Ramesh Patel",
    "age": 58,
    "gender": "Male",
    "bloodGroup": "B+",
    "chiefComplaint": "Crushing retrosternal chest pain",
    "triageCategory": "Red (Immediate)",
    "allergies": ["Penicillin"]
  }
  ```

### `GET /api/patients/:id`
Retrieves patient details along with their latest telemetry readings.

---

## 5. Emergency Incident Endpoints (`/api/emergencies`)

### `POST /api/emergencies`
Dispatches an emergency case, links ambulance and receiving hospital, calculates initial ETA, and broadcasts notification.
- **Request Body:**
  ```json
  {
    "ambulanceId": "65b...",
    "hospitalId": "65b...",
    "emergencyType": "Cardiac Arrest",
    "severity": "Critical",
    "patientData": {
      "name": "Ramesh Patel",
      "age": 58,
      "gender": "Male",
      "bloodGroup": "B+",
      "chiefComplaint": "Crushing retrosternal chest pain"
    }
  }
  ```

### `GET /api/emergencies`
Retrieves all emergencies. Filterable via query parameters: `?status=En+Route&hospitalId=...`.

### `PUT /api/emergencies/:id/acknowledge`
Hospital ER staff acknowledges incoming emergency and confirms room/team readiness.
- **Request Body:**
  ```json
  {
    "assignedBay": "Resuscitation Bay 1",
    "assignedDoctor": "Dr. Sarah Connor",
    "responseNotes": "Cath Lab team alerted and standby for primary PCI.",
    "readinessChecklist": {
      "traumaTeamAlerted": true,
      "bedReserved": true,
      "bloodUnitsPrepared": true,
      "ventilatorReady": true
    }
  }
  ```

### `PUT /api/emergencies/:id/status`
Updates status (e.g. `Arrived`, `Admitted`, `Completed`). When marked `Admitted` or `Completed`, automatically resets the ambulance status back to `Available`.

---

## 6. Biometric Vitals Endpoints (`/api/vitals`)

### `POST /api/vitals`
Ingests a vital reading sample, checks demonstration thresholds, creates alerts if abnormal, and broadcasts via Socket.IO.
- **Request Body:**
  ```json
  {
    "ambulanceId": "65b...",
    "patientId": "65b...",
    "heartRate": 132,
    "spo2": 91,
    "temperature": 39.2
  }
  ```

### `GET /api/vitals/:patientId`
Retrieves chronological prehospital vitals for chart rendering.

---

## 7. Alerts Endpoints (`/api/alerts`)

### `GET /api/alerts`
Retrieves threshold breach alerts. Supports filters: `?isAcknowledged=false&severity=critical`.

### `PUT /api/alerts/:id/acknowledge`
Marks an alert as acknowledged by ER medical staff.

---

## 8. IoT Simulation Endpoints (`/api/simulation`)

### `GET /api/simulation/status`
Returns `{ isRunning, currentPreset, routeStep, totalSteps }`.

### `POST /api/simulation/start`
Starts automated 3-second simulation loop.

### `POST /api/simulation/stop`
Pauses simulation loop.

### `POST /api/simulation/preset`
Sets active scenario:
- `"normal"`: Standard healthy vitals (HR 78 BPM, SpO2 98%, Temp 36.8°C)
- `"tachycardia"`: Elevated pulse (> 130 BPM)
- `"hypoxia"`: Oxygen desaturation (< 90%)
- `"hyperthermia"`: Core temperature spike (> 39.5°C)
- `"emergency_button"`: Simulates hardware SOS panic push button.
