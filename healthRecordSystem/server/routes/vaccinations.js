const router = require('express').Router();
let Vaccination = require('../models/Vaccination');

// Get all vaccinations
router.route('/').get(async (req, res) => {
  try {
    const vaccinations = await Vaccination.find().populate('patientId');
    res.json(vaccinations);
  } catch (err) {
    console.error('Error fetching vaccinations:', err);
    res.status(500).json('Error: ' + err.message);
  }
});

// Add new vaccination
router.route('/add').post(async (req, res) => {
  try {
    const { patientId, vaccineName, date, dose, nextDoseDate, status, notes } = req.body;

    // Validation
    if (!patientId || !vaccineName || !date || !dose || !status) {
      return res.status(400).json('Error: All required fields are needed');
    }

    const newVaccination = new Vaccination({
      patientId,
      vaccineName,
      date,
      dose,
      nextDoseDate,
      status,
      notes: notes || ''
    });

    const savedVaccination = await newVaccination.save();
    res.json({ message: 'Vaccination added!', vaccination: savedVaccination });
  } catch (err) {
    console.error('Error adding vaccination:', err);
    res.status(400).json('Error: ' + err.message);
  }
});

// Get vaccination by ID
router.route('/:id').get(async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id).populate('patientId');
    if (!vaccination) {
      return res.status(404).json('Error: Vaccination not found');
    }
    res.json(vaccination);
  } catch (err) {
    console.error('Error fetching vaccination:', err);
    res.status(400).json('Error: ' + err.message);
  }
});

// Update vaccination
router.route('/update/:id').post(async (req, res) => {
  try {
    const { patientId, vaccineName, date, dose, nextDoseDate, status, notes } = req.body;

    // Validation
    if (!patientId || !vaccineName || !date || !dose || !status) {
      return res.status(400).json('Error: All required fields are needed');
    }

    const vaccination = await Vaccination.findById(req.params.id);
    if (!vaccination) {
      return res.status(404).json('Error: Vaccination not found');
    }

    vaccination.patientId = patientId;
    vaccination.vaccineName = vaccineName;
    vaccination.date = date;
    vaccination.dose = dose;
    vaccination.nextDoseDate = nextDoseDate;
    vaccination.status = status;
    vaccination.notes = notes || '';

    const updatedVaccination = await vaccination.save();
    res.json({ message: 'Vaccination updated!', vaccination: updatedVaccination });
  } catch (err) {
    console.error('Error updating vaccination:', err);
    res.status(400).json('Error: ' + err.message);
  }
});

// Delete vaccination
router.route('/:id').delete(async (req, res) => {
  try {
    const vaccination = await Vaccination.findByIdAndDelete(req.params.id);
    if (!vaccination) {
      return res.status(404).json('Error: Vaccination not found');
    }
    res.json('Vaccination deleted.');
  } catch (err) {
    console.error('Error deleting vaccination:', err);
    res.status(400).json('Error: ' + err.message);
  }
});

module.exports = router;