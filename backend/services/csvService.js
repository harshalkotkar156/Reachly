const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Contact = require('../models/Contact');

const CSV_PATH = path.join(__dirname, '..', 'data', 'contacts.csv');

/**
 * Parse CSV and return an array of contact objects.
 */
const parseCSV = () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CSV_PATH)) {
      return reject(new Error(`CSV file not found at: ${CSV_PATH}`));
    }

    const results = [];

    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => {
        // Support both exact header names and trimmed/lowercased versions
        const sno = row['SNo'] || row['sno'] || row['S.No'] || null;
        const name = (row['Name'] || row['name'] || '').trim();
        const email = (row['Email'] || row['email'] || '').trim().toLowerCase();
        const title = (row['Title'] || row['title'] || '').trim();
        const company = (row['Company'] || row['company'] || '').trim();

        if (email) {
          results.push({ sno, name, email, title, company });
        }
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

/**
 * Import CSV contacts into MongoDB — skips duplicates.
 * Returns { inserted, skipped, total }
 */
const importCSV = async () => {
  const contacts = await parseCSV();

  let inserted = 0;
  let skipped = 0;

  for (const contact of contacts) {
    try {
      await Contact.create(contact);
      inserted++;
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate email — skip
        skipped++;
      } else {
        throw err;
      }
    }
  }

  return { inserted, skipped, total: contacts.length };
};

/**
 * Rescan CSV — only insert new emails not already in DB.
 * Returns { inserted, skipped, total }
 */
const rescanCSV = async () => {
  return importCSV(); // Same logic: duplicates are ignored via unique index
};

module.exports = { importCSV, rescanCSV };
