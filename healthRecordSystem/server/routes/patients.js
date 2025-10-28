const router = require('express').Router();
let Patient = require('../models/Patient');

// Get all patients
router.route('/').get(async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json('Error: ' + err.message);
  }
});

// Add new patient
router.route('/add').post(async (req, res) => {
  try {
    const { name, age, gender, village, contact, medicalHistory } = req.body;

    // Validation
    if (!name || !age || !gender || !village || !contact) {
      return res.status(400).json('Error: All fields are required');
    }

    const newPatient = new Patient({
      name,
      age,
      gender,
      village,
      contact,
      medicalHistory: medicalHistory || ''
    });

    const savedPatient = await newPatient.save();
    res.json({ message: 'Patient added!', patient: savedPatient });
  } catch (err) {
    console.error('Error adding patient:', err);
    res.status(400).json('Error: ' + err.message);
  }
});

// Get patient by ID
router.route('/:id').get(async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json('Error: Patient not found');
    }
    res.json(patient);
  } catch (err) {
    console.error('Error fetching patient:', err);
    res.status(400).json('Error: ' + err.message);
  }
});

// Update patient
router.route('/update/:id').post(async (req, res) => {
  try {
    const { name, age, gender, village, contact, medicalHistory } = req.body;

    // Validation
    if (!name || !age || !gender || !village || !contact) {
      return res.status(400).json('Error: All fields are required');
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json('Error: Patient not found');
    }

    patient.name = name;
    patient.age = age;
    patient.gender = gender;
    patient.village = village;
    patient.contact = contact;
    patient.medicalHistory = medicalHistory || '';

    const updatedPatient = await patient.save();
    res.json({ message: 'Patient updated!', patient: updatedPatient });
  } catch (err) {
    console.error('Error updating patient:', err);
    res.status(400).json('Error: ' + err.message);
  }
});

// Delete patient
router.route('/:id').delete(async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json('Error: Patient not found');
    }
    res.json('Patient deleted.');
  } catch (err) {
    console.error('Error deleting patient:', err);
    res.status(400).json('Error: ' + err.message);
  }
});

module.exports = router;