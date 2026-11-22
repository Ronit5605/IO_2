# Database Entity-Relationship (ER) Specifications

**Database Engine:** MongoDB 8.0 with Mongoose ODM  
**Database Name:** `smart_ambulance`  

---

## 1. Complete Mermaid ER Diagram

```mermaid
erDiagram
    USER ||--o{ AMBULANCE : "operates"
    USER ||--o{ HOSPITAL : "employed_at"
    HOSPITAL ||--o{ AMBULANCE : "has_assigned"
    HOSPITAL ||--o{ EMERGENCY : "receives"
    AMBULANCE ||--o{ EMERGENCY : "dispatched_to"
    PATIENT ||--o{ EMERGENCY : "subject_of"
    EMERGENCY ||--o{ VITAL_READING : "records"
    EMERGENCY ||--o{ ALERT : "triggers"
    EMERGENCY ||--o{ LOCATION_HISTORY : "tracks"
    HOSPITAL ||--o{ NOTIFICATION : "notified_via"
    AMBULANCE ||--o{ NOTIFICATION : "receives"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "admin | hospital_staff | paramedic"
        string phone
        ObjectId hospitalId FK
        ObjectId ambulanceId FK
        boolean isActive
        date createdAt
        date updatedAt
    }

    HOSPITAL {
        ObjectId _id PK
        string name
        string code UK
        string address
        string city
        number latitude
        number longitude
        string traumaLevel "Level 1 | Level 2 | Level 3"
        number totalBeds
        number availableBeds
        number icuBedsTotal
        number icuBedsAvailable
        object readinessStatus
        string status "Active | Diverting | Full"
        date createdAt
    }

    AMBULANCE {
        ObjectId _id PK
        string vehicleNumber UK
        string callSign
        string model
        string status "Available | On Duty | Emergency | Maintenance"
        string driverName
        string paramedicName
        ObjectId assignedHospitalId FK
        ObjectId activeEmergencyId FK
        number currentLatitude
        number currentLongitude
        number currentSpeed
        number currentHeading
        object iotDevice "status, battery, sensors"
        date updatedAt
    }

    PATIENT {
        ObjectId _id PK
        string patientId UK
        string name
        number age
        string gender "Male | Female | Other"
        string bloodGroup "A+ | B+ | O+ | AB+ | ..."
        string chiefComplaint
        string triageCategory "Red | Yellow | Green | Black"
        string[] allergies
        string[] medicalHistory
        object emergencyContact
        date createdAt
    }

    EMERGENCY {
        ObjectId _id PK
        string caseNumber UK
        ObjectId ambulanceId FK
        ObjectId hospitalId FK
        ObjectId patientId FK
        ObjectId createdById FK
        string status "Initiated | En Route | Hospital Acknowledged | Arrived | Admitted | Completed"
        string severity "Critical | High | Moderate | Stable"
        string emergencyType
        object pickupLocation
        object destinationHospital
        object currentLocation
        number distanceRemainingKm
        number etaMinutes
        object hospitalAcknowledgment
        object completionDetails
        date createdAt
    }

    VITAL_READING {
        ObjectId _id PK
        ObjectId patientId FK
        ObjectId emergencyId FK
        ObjectId ambulanceId FK
        number heartRate "BPM"
        number spo2 "Percentage"
        number temperature "Celsius"
        number bloodPressureSystolic
        number bloodPressureDiastolic
        number respiratoryRate
        boolean isAbnormal
        object[] abnormalParameters
        object sensorStatus
        date timestamp
    }

    ALERT {
        ObjectId _id PK
        ObjectId emergencyId FK
        ObjectId ambulanceId FK
        ObjectId patientId FK
        ObjectId hospitalId FK
        string alertType "HEART_RATE_CRITICAL | SPO2_CRITICAL | HIGH_FEVER | EMERGENCY_BUTTON | MANUAL_SOS"
        string severity "critical | warning | info"
        string parameter
        number value
        string threshold
        string message
        boolean isAcknowledged
        date acknowledgedAt
        ObjectId acknowledgedBy FK
        date createdAt
    }

    LOCATION_HISTORY {
        ObjectId _id PK
        ObjectId ambulanceId FK
        ObjectId emergencyId FK
        number latitude
        number longitude
        number speed
        number heading
        date timestamp
    }

    NOTIFICATION {
        ObjectId _id PK
        string recipientRole "all | admin | hospital_staff | paramedic"
        ObjectId recipientHospitalId FK
        ObjectId recipientAmbulanceId FK
        string title
        string message
        string type "emergency_created | vital_alert | hospital_ack | status_update"
        object data
        boolean isRead
        date createdAt
    }
```

---

## 2. Key Collections, Indexes & Constraints

| Collection Name | Primary Index | Secondary Indexes | Validation & Integrity Rules |
|---|---|---|---|
| `users` | `_id` | `email` (Unique, Lowercase) | Passwords hashed using bcrypt (10 rounds), valid RFC email regex |
| `hospitals` | `_id` | `code` (Unique), Geo: `(latitude, longitude)` | Required trauma level and emergency hotline contacts |
| `ambulances` | `_id` | `vehicleNumber` (Unique), `status`, Geo: `(latitude, longitude)` | Status restricted to enumerated state machine |
| `patients` | `_id` | `patientId` (Unique), `triageCategory` | Age validated between 0 and 130, required chief complaints |
| `emergencies` | `_id` | `caseNumber` (Unique), `hospitalId`, `ambulanceId`, `status` | Automatic linkage to active vehicle and hospital |
| `vitalreadings`| `_id` | Compound: `(patientId, timestamp: -1)`, `(emergencyId, timestamp: -1)` | Heart rate (20-300), SpO2 (50-100), Temp (25-45) |
| `alerts` | `_id` | Compound: `(hospitalId, isAcknowledged, createdAt: -1)` | Automatic 15-second debounce against duplicate unacknowledged triggers |
| `locationhistories` | `_id` | Compound: `(ambulanceId, timestamp: -1)` | Historical coordinates tracking for route replay |
| `notifications` | `_id` | Compound: `(recipientRole, isRead, createdAt: -1)` | Targeted unread counters for hospital staff and paramedics |
