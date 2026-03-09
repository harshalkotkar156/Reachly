const nodemailer = require('nodemailer');
const path = require('path');
const Contact = require('../models/Contact');
const { getEmailTemplate } = require('../templates/emailTemplate');

const RESUME_PATH = path.join(__dirname, '..', 'resume', 'resume.pdf');
const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 10000; // 10 seconds between batches

// In-memory state for live progress tracking
let sendingState = {
  isRunning: false,
  currentBatch: 0,
  totalBatches: 0,
  sentCount: 0,
  failedCount: 0,
  totalPending: 0,
  message: '',
};

const getSendingState = () => ({ ...sendingState });

/**
 * Create a Nodemailer transporter from .env credentials.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: parseInt(process.env.SMTP_PORT, 10) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send a single email to one contact.
 */
const sendEmail = async (transporter, contact) => {
  const html = getEmailTemplate(contact.name, contact.company);

  const mailOptions = {
    from: `"Harshal Kotkar" <${process.env.EMAIL_USER}>`,
    to: contact.email,
    subject: `Application for Full Stack Developer Role`,
    html,
    attachments: [
      {
        filename: 'Harshal_Kotkar_Resume.pdf',
        path: RESUME_PATH,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Sleep helper
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Start batch email sending.
 * Processes all pending contacts in batches of BATCH_SIZE.
 */
const startSending = async () => {
  if (sendingState.isRunning) {
    throw new Error('Email sending is already in progress.');
  }

  const pendingContacts = await Contact.find({ status: 'pending' });

  if (pendingContacts.length === 0) {
    return { message: 'No pending contacts to send emails to.' };
  }

  sendingState = {
    isRunning: true,
    currentBatch: 0,
    totalBatches: Math.ceil(pendingContacts.length / BATCH_SIZE),
    sentCount: 0,
    failedCount: 0,
    totalPending: pendingContacts.length,
    message: 'Starting...',
  };

  const transporter = createTransporter();

  // Run async in background — don't await this
  (async () => {
    try {
      for (let i = 0; i < pendingContacts.length; i += BATCH_SIZE) {
        const batch = pendingContacts.slice(i, i + BATCH_SIZE);
        sendingState.currentBatch++;
        sendingState.message = `Sending batch ${sendingState.currentBatch} / ${sendingState.totalBatches}...`;

        const promises = batch.map(async (contact) => {
          try {
            await sendEmail(transporter, contact);
            await Contact.findByIdAndUpdate(contact._id, {
              status: 'sent',
              sentAt: new Date(),
              errorMessage: null,
            });
            sendingState.sentCount++;
          } catch (err) {
            await Contact.findByIdAndUpdate(contact._id, {
              status: 'failed',
              errorMessage: err.message,
            });
            sendingState.failedCount++;
            console.error(`Failed to send to ${contact.email}: ${err.message}`);
          }
        });

        await Promise.all(promises);

        // Wait before next batch — unless it's the last batch
        if (i + BATCH_SIZE < pendingContacts.length) {
          sendingState.message = `Batch ${sendingState.currentBatch} done. Waiting 10s before next batch...`;
          await sleep(BATCH_DELAY_MS);
        }
      }

      sendingState.message = 'All emails processed.';
    } catch (err) {
      sendingState.message = `Error: ${err.message}`;
      console.error('Sending error:', err);
    } finally {
      sendingState.isRunning = false;
    }
  })();

  return {
    message: 'Email sending started.',
    totalPending: pendingContacts.length,
    totalBatches: sendingState.totalBatches,
  };
};

module.exports = { startSending, getSendingState };
