# Reachly — Automated HR Email Sender

> Send personalized job inquiry emails to HR contacts from a CSV list, with rate limiting, progress tracking, and resume attachment.

---

## Tech Stack

| Layer     | Tech                                  |
|-----------|---------------------------------------|
| Backend   | Node.js, Express, MongoDB, Mongoose   |
| Email     | Nodemailer (SMTP)                     |
| CSV Parse | csv-parser                            |
| Frontend  | React 18, Vite, TailwindCSS, Axios    |
| Database  | MongoDB                               |

---

## Folder Structure

```
Reachly/
│
├── backend/
│   ├── config/
│   │   └── db.js                  ← MongoDB connection
│   ├── controllers/
│   │   └── emailController.js     ← API handlers
│   ├── models/
│   │   └── Contact.js             ← Mongoose schema
│   ├── routes/
│   │   └── emailRoutes.js         ← Express routes
│   ├── services/
│   │   ├── csvService.js          ← CSV parsing & import logic
│   │   └── emailService.js        ← Batch email sending logic
│   ├── templates/
│   │   └── emailTemplate.js       ← HTML email template
│   ├── data/
│   │   └── contacts.csv           ← ← PLACE YOUR CSV HERE
│   ├── resume/
│   │   └── resume.pdf             ← ← PLACE YOUR RESUME HERE
│   ├── server.js
│   ├── package.json
│   └── .env                       ← ← FILL THIS BEFORE RUNNING
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx      ← Main layout + state management
    │   │   ├── Stats.jsx          ← 4-card stats overview
    │   │   ├── Controls.jsx       ← Buttons + progress bar
    │   │   └── EmailTable.jsx     ← Contact history table
    │   ├── pages/
    │   │   └── Home.jsx
    │   ├── services/
    │   │   └── api.js             ← Axios API calls
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css              ← TailwindCSS + custom styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── .env
```

---

## Setup Instructions

### Step 1 — Fill your `.env`

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/reachly
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

> **Gmail users:** Enable **2-Step Verification** on your Google account, then create an **App Password** at:
> https://myaccount.google.com/apppasswords
> Use that 16-character App Password as `EMAIL_PASS`.

---

### Step 2 — Add your CSV

Place your contacts CSV at:

```
backend/data/contacts.csv
```

Required columns:

```
SNo,Name,Email,Title,Company
```

---

### Step 3 — Add your resume

Place your resume PDF at:

```
backend/resume/resume.pdf
```

---

### Step 4 — Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### Step 5 — Start MongoDB

Make sure MongoDB is running locally:

```bash
mongod
```

Or use a MongoDB Atlas URI in `MONGO_URI`.

---

### Step 6 — Run the application

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
```

Backend runs at: http://localhost:5000

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Usage

1. Open `http://localhost:5173`
2. Click **Import CSV** — parses and stores HR contacts from CSV into MongoDB
3. Click **Start Sending Emails** — sends personalized emails in batches of 20 (10s delay between batches)
4. Watch live **progress bar** and **batch counter** in the UI
5. If you update the CSV with new contacts, click **Rescan CSV** to add only new entries
6. View full **Email History** table with name, email, company, status, and sent time

---

## API Endpoints

| Method | Endpoint          | Description                       |
|--------|-------------------|-----------------------------------|
| POST   | /api/import-csv   | Parse CSV and insert into MongoDB |
| POST   | /api/rescan-csv   | Re-import CSV, skip duplicates    |
| POST   | /api/start-sending| Start batch email sending         |
| GET    | /api/stats        | Get total/sent/pending/failed     |
| GET    | /api/contacts     | Paginated contact list            |
| GET    | /api/progress     | Live sending progress             |

---

## Email Sending Rules

- **Batch size:** 20 emails per batch
- **Delay between batches:** 10 seconds
- **Each email is sent individually** — no CC/BCC
- **Resume attached** automatically from `backend/resume/resume.pdf`
- **Never re-sends** to contacts already marked `sent`

---

## Customise the Email Template

Edit `backend/templates/emailTemplate.js` to change the email content.

Variables available:
- `${name}` — HR person's name
- `${company}` — Company name

---
