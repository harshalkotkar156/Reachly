const Contact = require('../models/Contact');
const { importCSV, rescanCSV } = require('../services/csvService');
const { startSending, getSendingState } = require('../services/emailService');

// POST /import-csv
const importCSVHandler = async (req, res) => {
  try {
    const result = await importCSV();
    res.json({
      success: true,
      message: `Import complete. Inserted: ${result.inserted}, Skipped: ${result.skipped}`,
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /rescan-csv
const rescanCSVHandler = async (req, res) => {
  try {
    const result = await rescanCSV();
    res.json({
      success: true,
      message: `Rescan complete. New contacts inserted: ${result.inserted}, Skipped: ${result.skipped}`,
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /start-sending
const startSendingHandler = async (req, res) => {
  try {
    const result = await startSending();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /stats
const getStatsHandler = async (req, res) => {
  try {
    const [total, sent, pending, failed] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'sent' }),
      Contact.countDocuments({ status: 'pending' }),
      Contact.countDocuments({ status: 'failed' }),
    ]);

    const sendingState = getSendingState();

    res.json({
      success: true,
      stats: { total, sent, pending, failed },
      sending: sendingState,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /contacts
const getContactsHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const statusFilter = req.query.status;

    const query = statusFilter ? { status: statusFilter } : {};

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name email company title status sentAt createdAt'),
      Contact.countDocuments(query),
    ]);

    res.json({
      success: true,
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /progress
const getProgressHandler = (req, res) => {
  const state = getSendingState();
  res.json({ success: true, progress: state });
};

module.exports = {
  importCSVHandler,
  rescanCSVHandler,
  startSendingHandler,
  getStatsHandler,
  getContactsHandler,
  getProgressHandler,
};
