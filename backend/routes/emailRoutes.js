const express = require('express');
const router = express.Router();
const {
  importCSVHandler,
  rescanCSVHandler,
  startSendingHandler,
  stopSendingHandler,
  retryFailedHandler,
  getStatsHandler,
  getContactsHandler,
  getProgressHandler,
} = require('../controllers/emailController');

router.post('/import-csv', importCSVHandler);
router.post('/rescan-csv', rescanCSVHandler);
router.post('/start-sending', startSendingHandler);
router.post('/stop-sending', stopSendingHandler);
router.post('/retry-failed', retryFailedHandler);
router.get('/stats', getStatsHandler);
router.get('/contacts', getContactsHandler);
router.get('/progress', getProgressHandler);

module.exports = router;
