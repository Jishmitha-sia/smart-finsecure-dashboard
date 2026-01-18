const express = require('express');
const { seedDatabase } = require('../controllers/seed.controller');

const router = express.Router();

// Seed database with demo data (POST to be explicit)
router.post('/seed', seedDatabase);

module.exports = router;
