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
  stopRequested: false,
  currentBatch: 0,
  totalBatches: 0,
  sentCount: 0,
  failedCount: 0,
  totalToSend: 0,
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
 * Sleep helper — respects stopRequested flag.
 */
const sleep = (ms) =>
  new Promise((resolve) => {
    const interval = 500;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      if (elapsed >= ms || sendingState.stopRequested) {
        clearInterval(timer);
        resolve();
      }
    }, interval);
  });

/**
 * Start batch email sending.
 * @param {number} count - How many pending emails to send (from frontend input).
 */
const startSending = async (count) => {
  if (sendingState.isRunning) {
    throw new Error('Email sending is already in progress.');
  }

  const limit = count && count > 0 ? parseInt(count, 10) : 20;

  // Fetch only the requested number of pending contacts
  const pendingContacts = await Contact.find({ status: 'pending' }).limit(limit);

  if (pendingContacts.length === 0) {
    return { message: 'No pending contacts to send emails to.' };
  }

  sendingState = {
    isRunning: true,
    stopRequested: false,
    currentBatch: 0,
    totalBatches: Math.ceil(pendingContacts.length / BATCH_SIZE),
    sentCount: 0,
    failedCount: 0,
    totalToSend: pendingContacts.length,
    message: 'Starting...',
  };

  const transporter = createTransporter();

  // Run async in background — don't await this
  (async () => {
    try {
      for (let i = 0; i < pendingContacts.length; i += BATCH_SIZE) {
        // Check stop flag before each batch
        if (sendingState.stopRequested) {
          sendingState.message = `Stopped. Sent ${sendingState.sentCount} emails.`;
          break;
        }

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

        // Wait before next batch — unless it's the last batch or stop was requested
        const isLastBatch = i + BATCH_SIZE >= pendingContacts.length;
        if (!isLastBatch && !sendingState.stopRequested) {
          sendingState.message = `Batch ${sendingState.currentBatch} done. Waiting 10s before next batch...`;
          await sleep(BATCH_DELAY_MS);
        }
      }

      if (!sendingState.stopRequested) {
        sendingState.message = `Done! Sent ${sendingState.sentCount} of ${sendingState.totalToSend} emails.`;
      }
    } catch (err) {
      sendingState.message = `Error: ${err.message}`;
      console.error('Sending error:', err);
    } finally {
      sendingState.isRunning = false;
      sendingState.stopRequested = false;
    }
  })();

  return {
    message: `Sending ${pendingContacts.length} emails in ${sendingState.totalBatches} batch(es).`,
    totalToSend: pendingContacts.length,
    totalBatches: sendingState.totalBatches,
  };
};

/**
 * Signal the background sender to stop after finishing the current batch.
 */
const stopSending = () => {
  if (!sendingState.isRunning) {
    return { message: 'No sending in progress.' };
  }
  sendingState.stopRequested = true;
  sendingState.message = 'Stop requested — finishing current batch...';
  return { message: 'Stop requested. Will stop after current batch completes.' };
};

module.exports = { startSending, stopSending, getSendingState };
