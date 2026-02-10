const express = require('express');
const router = express.Router();
const { processPayment, getPaymentHistory, generateTicketPDF } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/process', protect, processPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/ticket/:ticketNumber', protect, generateTicketPDF);

module.exports = router;
