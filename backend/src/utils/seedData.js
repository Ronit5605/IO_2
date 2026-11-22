import mongoose from 'mongoose';
import User from '../models/User.js';
import Ambulance from '../models/Ambulance.js';
import Hospital from '../models/Hospital.js';
import Patient from '../models/Patient.js';
import Emergency from '../models/Emergency.js';
import VitalReading from '../models/VitalReading.js';
import Alert from '../models/Alert.js';
import Notification from '../models/Notification.js';

export const seedDatabase = async (forceReset = false) => {
  try {
    if (forceReset) {
      try {
        await mongoose.connection.db.dropDatabase();
        console.log('[Seed] Dropped previous database collections for clean reset.');
      } catch (e) {
        // Ignore if DB is new
      }
    } else {
      const existingAmbulances = await Ambulance.countDocuments();
      if (existingAmbulances > 0) {
        console.log('[Seed] Database already initialized with ambulances and hospitals. Skipping re-seed.');
        return;
      }
    }

    console.log('[Seed] Database is empty. Seeding demo data for academic presentation...');

    // 1. Create 3 Hospitals
    const hospitals = await Hospital.create([
      {
        name: 'Apollo Speciality Hospital & Trauma Center',
        code: 'APOLLO-SURAT',
        address: 'Ring Road, Athwa Lines',
        city: 'Surat',
        location: { latitude: 21.1895, longitude: 72.8258 },
        emergencyContact: { phone: '+91 261 245 8899', hotline: '1066', email: 'er@apollo-surat.org' },
        traumaLevel: 'Level 1',
        totalBeds: 120,
        availableBeds: 18,
        icuBedsTotal: 30,
        icuBedsAvailable: 5,
        readinessStatus: { traumaTeamOnStandby: true, cathLabReady: true, bloodBankReady: true, emergencyBaysOpen: 4 },
        status: 'Active',
      },
      {
        name: 'Government Civil Hospital Emergency Wing',
        code: 'CIVIL-SURAT',
        address: 'Majura Gate, Ring Road',
        city: 'Surat',
        location: { latitude: 21.1780, longitude: 72.8200 },
        emergencyContact: { phone: '+91 261 224 4455', hotline: '108', email: 'er@civilhospital.gov.in' },
        traumaLevel: 'Level 1',
        totalBeds: 250,
        availableBeds: 34,
        icuBedsTotal: 45,
        icuBedsAvailable: 8,
        readinessStatus: { traumaTeamOnStandby: true, cathLabReady: true, bloodBankReady: true, emergencyBaysOpen: 6 },
        status: 'Active',
      },
      {
        name: 'Sunshine Multi-Speciality Cardiac Institute',
        code: 'SUNSHINE-SURAT',
        address: 'Dumas Road, Piplod',
        city: 'Surat',
        location: { latitude: 21.1630, longitude: 72.7840 },
        emergencyContact: { phone: '+91 261 289 1122', hotline: '102', email: 'er@sunshineheart.com' },
        traumaLevel: 'Level 2',
        totalBeds: 80,
        availableBeds: 12,
        icuBedsTotal: 20,
        icuBedsAvailable: 3,
        readinessStatus: { traumaTeamOnStandby: true, cathLabReady: true, bloodBankReady: true, emergencyBaysOpen: 3 },
        status: 'Active',
      },
    ]);

    // 2. Create 3 Ambulances
    const ambulances = await Ambulance.create([
      {
        vehicleNumber: 'GJ-05-EM-1081',
        callSign: 'AMB-ALPHA-01',
        model: 'Force Motors Advanced Life Support (ALS) ICU',
        status: 'Emergency',
        driverName: 'Rajesh Sharma',
        paramedicName: 'Vikram Mehta (EMT-P)',
        assignedHospitalId: hospitals[0]._id,
        currentLocation: {
          latitude: 21.1730,
          longitude: 72.8235,
          speed: 52,
          heading: 42,
          updatedAt: new Date(),
        },
        iotDevice: {
          deviceId: 'ESP32-AMB-01',
          status: 'Online',
          batteryLevel: 94,
          signalStrength: -68,
          sensors: { max30102: true, ds18b20: true, gps: true, emergencyButton: true },
          lastHeartbeat: new Date(),
        },
      },
      {
        vehicleNumber: 'GJ-05-EM-1082',
        callSign: 'AMB-BRAVO-02',
        model: 'Mercedes-Benz Sprinter Mobile ICU',
        status: 'On Duty',
        driverName: 'Sanjay Patel',
        paramedicName: 'Priya Joshi (EMT-Paramedic)',
        assignedHospitalId: hospitals[1]._id,
        currentLocation: {
          latitude: 21.1660,
          longitude: 72.8180,
          speed: 38,
          heading: 120,
          updatedAt: new Date(),
        },
        iotDevice: {
          deviceId: 'ESP32-AMB-02',
          status: 'Online',
          batteryLevel: 88,
          signalStrength: -72,
          sensors: { max30102: true, ds18b20: true, gps: true, emergencyButton: true },
          lastHeartbeat: new Date(),
        },
      },
      {
        vehicleNumber: 'GJ-05-EM-1083',
        callSign: 'AMB-CHARLIE-03',
        model: 'Tata Winger Type C Cardiac Ambulance',
        status: 'Available',
        driverName: 'Amit Verma',
        paramedicName: 'Karan Singhania (EMT)',
        assignedHospitalId: hospitals[2]._id,
        currentLocation: {
          latitude: 21.1620,
          longitude: 72.7830,
          speed: 0,
          heading: 0,
          updatedAt: new Date(),
        },
        iotDevice: {
          deviceId: 'ESP32-AMB-03',
          status: 'Online',
          batteryLevel: 100,
          signalStrength: -60,
          sensors: { max30102: true, ds18b20: true, gps: true, emergencyButton: true },
          lastHeartbeat: new Date(),
        },
      },
    ]);

    // 3. Create Demo Users
    const users = await User.create([
      {
        name: 'Chief Administrator',
        email: 'admin@smartpulse.io',
        password: 'Admin@1234',
        role: 'admin',
        phone: '+91 98765 00001',
      },
      {
        name: 'Dr. Sarah Connor (Apollo ER Staff)',
        email: 'apollo@smartpulse.io',
        password: 'Hospital@1234',
        role: 'hospital_staff',
        hospitalId: hospitals[0]._id,
        phone: '+91 98765 00002',
      },
      {
        name: 'Dr. Ramesh Gupta (Civil ER Staff)',
        email: 'civil@smartpulse.io',
        password: 'Hospital@1234',
        role: 'hospital_staff',
        hospitalId: hospitals[1]._id,
        phone: '+91 98765 00003',
      },
      {
        name: 'Paramedic Vikram Mehta',
        email: 'paramedic1@smartpulse.io',
        password: 'Paramedic@1234',
        role: 'paramedic',
        ambulanceId: ambulances[0]._id,
        hospitalId: hospitals[0]._id,
        phone: '+91 98765 00004',
      },
      {
        name: 'Paramedic Priya Joshi',
        email: 'paramedic2@smartpulse.io',
        password: 'Paramedic@1234',
        role: 'paramedic',
        ambulanceId: ambulances[1]._id,
        hospitalId: hospitals[1]._id,
        phone: '+91 98765 00005',
      },
    ]);

    // 4. Create 5 Patients
    const patients = await Patient.create([
      {
        patientId: 'PAT-4011',
        name: 'Harish Bhai Parekh',
        age: 62,
        gender: 'Male',
        bloodGroup: 'B+',
        emergencyContact: { name: 'Kavita Parekh', relation: 'Wife', phone: '+91 98251 12345' },
        allergies: ['Penicillin'],
        medicalHistory: ['Hypertension', 'Type 2 Diabetes', 'Coronary Artery Disease'],
        chiefComplaint: 'Acute substernal crushing chest pain radiating to left jaw',
        triageCategory: 'Red (Immediate)',
        notes: 'STEMI suspected. ECG administered in ambulance. Continuous vitals streaming enabled.',
      },
      {
        patientId: 'PAT-4012',
        name: 'Sunita Sharma',
        age: 34,
        gender: 'Female',
        bloodGroup: 'O+',
        emergencyContact: { name: 'Aakash Sharma', relation: 'Husband', phone: '+91 98252 23456' },
        allergies: ['Sulfa drugs'],
        medicalHistory: ['Mild Asthma'],
        chiefComplaint: 'Severe road collision blunt chest trauma and multiple lacerations',
        triageCategory: 'Red (Immediate)',
        notes: 'Seatbelt sign present, oxygen administered via non-rebreather mask.',
      },
      {
        patientId: 'PAT-4013',
        name: 'Devang Modi',
        age: 48,
        gender: 'Male',
        bloodGroup: 'A+',
        emergencyContact: { name: 'Geeta Modi', relation: 'Sister', phone: '+91 98253 34567' },
        allergies: [],
        medicalHistory: ['Transient Ischemic Attack (2024)'],
        chiefComplaint: 'Sudden onset right-sided hemiparesis and facial droop',
        triageCategory: 'Red (Immediate)',
        notes: 'Cincinnati Prehospital Stroke Scale positive (3/3). FAST protocol initiated.',
      },
      {
        patientId: 'PAT-4014',
        name: 'Manish Choksi',
        age: 71,
        gender: 'Male',
        bloodGroup: 'AB+',
        emergencyContact: { name: 'Nikhil Choksi', relation: 'Son', phone: '+91 98254 45678' },
        allergies: ['Aspirin'],
        medicalHistory: ['COPD', 'Congestive Heart Failure'],
        chiefComplaint: 'Acute exacerbation of respiratory distress, severe orthopnea',
        triageCategory: 'Yellow (Delayed)',
        notes: 'BiPAP delivered in transit, SpO2 recovering towards 92%.',
      },
      {
        patientId: 'PAT-4015',
        name: 'Anita Desai',
        age: 26,
        gender: 'Female',
        bloodGroup: 'O-',
        emergencyContact: { name: 'Rohit Desai', relation: 'Father', phone: '+91 98255 56789' },
        allergies: ['Peanuts'],
        medicalHistory: ['None reported'],
        chiefComplaint: 'Anaphylactic reaction following bee sting, stridor present',
        triageCategory: 'Red (Immediate)',
        notes: 'Intramuscular epinephrine (0.3mg) administered at 16:15. Vitals stabilizing.',
      },
    ]);

    // 5. Create Active Emergency Case for AMB-01 -> Apollo Hospital with Patient 1
    const emergency1 = await Emergency.create({
      caseNumber: 'EMG-880912',
      ambulanceId: ambulances[0]._id,
      hospitalId: hospitals[0]._id,
      patientId: patients[0]._id,
      createdById: users[3]._id,
      status: 'Hospital Acknowledged',
      severity: 'Critical',
      emergencyType: 'Cardiac Arrest',
      pickupLocation: {
        address: 'Sector 5, Althan Road, Surat',
        latitude: 21.1550,
        longitude: 72.8050,
      },
      destinationHospital: {
        name: hospitals[0].name,
        latitude: hospitals[0].location.latitude,
        longitude: hospitals[0].location.longitude,
      },
      currentLocation: ambulances[0].currentLocation,
      etaMinutes: 8,
      distanceRemainingKm: 3.4,
      hospitalAcknowledgment: {
        isAcknowledged: true,
        acknowledgedAt: new Date(Date.now() - 5 * 60 * 1000),
        acknowledgedBy: users[1]._id,
        assignedBay: 'Resuscitation Bay 1 (Trauma Wing)',
        assignedDoctor: 'Dr. Sarah Connor (ER Head)',
        readinessChecklist: {
          traumaTeamAlerted: true,
          bedReserved: true,
          bloodUnitsPrepared: true,
          ventilatorReady: true,
          otStandby: true,
        },
        responseNotes: 'Cath Lab activated for immediate primary PCI upon arrival.',
      },
    });

    // Link active emergency to ambulance 1
    ambulances[0].activeEmergencyId = emergency1._id;
    await ambulances[0].save();

    // 6. Create Historical Completed Emergency for AMB-02 -> Civil Hospital with Patient 2
    await Emergency.create({
      caseNumber: 'EMG-774120',
      ambulanceId: ambulances[1]._id,
      hospitalId: hospitals[1]._id,
      patientId: patients[1]._id,
      createdById: users[4]._id,
      status: 'Completed',
      severity: 'High',
      emergencyType: 'Road Accident / Trauma',
      pickupLocation: {
        address: 'Ghod Dod Road Junction',
        latitude: 21.1710,
        longitude: 72.8090,
      },
      destinationHospital: {
        name: hospitals[1].name,
        latitude: hospitals[1].location.latitude,
        longitude: hospitals[1].location.longitude,
      },
      currentLocation: ambulances[1].currentLocation,
      etaMinutes: 0,
      distanceRemainingKm: 0,
      hospitalAcknowledgment: {
        isAcknowledged: true,
        acknowledgedAt: new Date(Date.now() - 45 * 60 * 1000),
        acknowledgedBy: users[2]._id,
        assignedBay: 'Trauma Bay 3',
        assignedDoctor: 'Dr. Ramesh Gupta',
        readinessChecklist: {
          traumaTeamAlerted: true,
          bedReserved: true,
          bloodUnitsPrepared: true,
          ventilatorReady: false,
          otStandby: false,
        },
        responseNotes: 'Patient successfully stabilized and admitted to ICU.',
      },
      completionDetails: {
        completedAt: new Date(Date.now() - 20 * 60 * 1000),
        outcome: 'Admitted to Surgical Intensive Care Unit (SICU)',
        handoffSummary: 'Full patient transfer completed without incidents.',
      },
    });

    // 7. Seed Sample Vital Readings for Patient 1
    const baseTime = Date.now() - 15 * 60 * 1000;
    const sampleVitals = [];
    for (let i = 0; i < 15; i++) {
      const timeOffset = baseTime + i * 60 * 1000;
      const hr = 84 + Math.round(Math.sin(i / 2) * 8);
      const spo2 = 96 + Math.round(Math.cos(i / 3) * 2);
      const temp = +(37.1 + Math.sin(i / 4) * 0.3).toFixed(1);

      sampleVitals.push({
        patientId: patients[0]._id,
        emergencyId: emergency1._id,
        ambulanceId: ambulances[0]._id,
        heartRate: hr,
        spo2: spo2,
        temperature: temp,
        bloodPressureSystolic: 135,
        bloodPressureDiastolic: 88,
        respiratoryRate: 18,
        sensorStatus: { max30102: 'OK', ds18b20: 'OK', hardwareState: 'SIMULATED' },
        isAbnormal: hr > 100 || spo2 < 94,
        timestamp: new Date(timeOffset),
      });
    }
    await VitalReading.insertMany(sampleVitals);

    // 8. Seed Sample Alert
    await Alert.create({
      emergencyId: emergency1._id,
      ambulanceId: ambulances[0]._id,
      patientId: patients[0]._id,
      hospitalId: hospitals[0]._id,
      alertType: 'HEART_RATE_CRITICAL',
      severity: 'warning',
      parameter: 'Heart Rate (Tachycardia)',
      value: 104,
      threshold: 'Max 100 BPM',
      message: 'Abnormal Heart Rate detected: 104 BPM (Exceeds demonstration threshold)',
      isAcknowledged: true,
      acknowledgedAt: new Date(Date.now() - 10 * 60 * 1000),
      acknowledgedBy: users[1]._id,
    });

    // 9. Seed Sample Notification
    await Notification.create({
      recipientRole: 'hospital_staff',
      recipientHospitalId: hospitals[0]._id,
      recipientAmbulanceId: ambulances[0]._id,
      title: 'CRITICAL INCOMING: Cardiac Patient Harish Bhai Parekh',
      message: 'Ambulance AMB-ALPHA-01 is en route to Apollo Hospital. ETA: 8 minutes. Trauma bay ready.',
      type: 'emergency_created',
      data: {
        emergencyId: emergency1._id,
        ambulanceId: ambulances[0]._id,
        patientId: patients[0]._id,
      },
      isRead: false,
    });

    console.log('[Seed] Database seeded successfully with demo ambulances, hospitals, patients, users, and vitals!');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
  }
};

// Allow direct execution via `node src/utils/seedData.js`
if (process.argv[1]?.endsWith('seedData.js')) {
  import('../config/db.js').then(async ({ connectDB, closeDB }) => {
    await connectDB();
    await seedDatabase();
    await closeDB();
    process.exit(0);
  });
}
