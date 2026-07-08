# Makeup Booking Management Assistant / 接妆管理助手

A lightweight booking management tool for freelance makeup artists. Artists share a link with clients, who can view pricing and book appointments. The artist dashboard manages the full workflow and tracks income.

## Features

- **Pricing Management** — Create and manage makeup service types with pricing, descriptions, and add-on services
- **Appointment Booking** — Calendar-based scheduling with available time slots; clients self-book online
- **Income Dashboard** — Monthly overview, detailed records, and manual entry for offline bookings
- **Notices** — Configurable announcements shown to clients on login (cancellation policy, prep instructions, etc.)
- **Role-based Access** — Admin (artist) manages everything; clients view pricing and manage their own bookings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Tailwind CSS 4 + Vite 8 |
| Backend | Node.js + Express 5 |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT + bcrypt |

## Getting Started

### Prerequisites

- Node.js >= 18

### Install

```bash
npm run install-all
```

### Run (development)

```bash
npm run dev
```

This starts both the backend server and the Vite dev server concurrently.

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Build for production

```bash
cd client && npm run build
```

## Project Structure

```
├── client/             # React frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Shared components
│   │   ├── api.js      # API client
│   │   └── auth.jsx    # Auth context
│   └── vite.config.js
├── server/             # Express backend
│   ├── index.js        # Entry point
│   ├── db.js           # SQLite setup & schema
│   ├── routes/         # API routes
│   │   ├── auth.js
│   │   ├── makeup.js
│   │   ├── appointments.js
│   │   ├── income.js
│   │   └── notices.js
│   └── middleware/
│       └── auth.js     # JWT middleware
└── package.json
```

## License

MIT
