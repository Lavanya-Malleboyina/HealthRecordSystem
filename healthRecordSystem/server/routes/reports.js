const router = require('express').Router();
let Report = require('../models/Report');

// Get all reports
router.route('/').get(async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Add new report
router.route('/add').post(async (req, res) => {
  const { title, type, data } = req.body;

  const newReport = new Report({
    title,
    type,
    data
  });

  try {
    await newReport.save();
    res.json('Report added!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Get report by ID
router.route('/:id').get(async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    res.json(report);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Update report
router.route('/update/:id').post(async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    report.title = req.body.title;
    report.type = req.body.type;
    report.data = req.body.data;

    await report.save();
    res.json('Report updated!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Delete report
router.route('/:id').delete(async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json('Report deleted.');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;