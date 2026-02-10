const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, getEventAnalytics } = require('../controllers/analyticsController');
const { protect, organizer } = require('../middleware/auth');

router.get('/dashboard', protect, organizer, getDashboardAnalytics);
router.get('/event/:eventId', protect, organizer, getEventAnalytics);

module.exports = router;
