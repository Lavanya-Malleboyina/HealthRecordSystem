const router = require('express').Router();
let Appointment = require('../models/Appointment');

// Get all appointments
router.route('/').get(async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('patientId');
    res.json(appointments);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Add new appointment
router.route('/add').post(async (req, res) => {
  const { patientId, date, time, reason, status } = req.body;

  const newAppointment = new Appointment({
    patientId,
    date,
    time,
    reason,
    status
  });

  try {
    await newAppointment.save();
    res.json('Appointment added!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Get appointment by ID
router.route('/:id').get(async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patientId');
    res.json(appointment);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Update appointment
router.route('/update/:id').post(async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    appointment.patientId = req.body.patientId;
    appointment.date = req.body.date;
    appointment.time = req.body.time;
    appointment.reason = req.body.reason;
    appointment.status = req.body.status;

    await appointment.save();
    res.json('Appointment updated!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Delete appointment
router.route('/:id').delete(async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json('Appointment deleted.');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;