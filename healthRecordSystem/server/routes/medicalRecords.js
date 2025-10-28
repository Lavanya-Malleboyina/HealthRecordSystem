const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');

// Medical record routes
router.get('/patient/:patientId', medicalRecordController.getPatientMedicalRecords);
router.get('/:id', medicalRecordController.getMedicalRecordById);
router.post('/patient/:patientId', medicalRecordController.createMedicalRecord);
router.put('/:id', medicalRecordController.updateMedicalRecord);

module.exports = router;  // Make sure this exports the router