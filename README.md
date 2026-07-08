# Makeup Booking Management Assistant / 接妆管理助手

A lightweight booking management tool for freelance makeup artists. Artists share a personalized link with clients, who can view pricing, browse portfolios, and book appointments. The artist dashboard manages the full workflow, tracks income, and handles client communications.

## Features

- **Pricing Management** — Create and manage makeup service types with pricing, descriptions, and add-on services
- **Appointment Booking** — Calendar-based scheduling with available time slots; clients self-book online
- **Income Dashboard** — Monthly overview, detailed records, and manual entry for offline bookings
- **Portfolio Showcase** — Upload and manage before/after photos to display work to potential clients
- **Reviews & Ratings** — Clients leave reviews after appointments; artists can reply and manage feedback
- **Notifications** — In-app notification center for appointment updates and system messages
- **Notices** — Configurable announcements shown to clients on login (cancellation policy, prep instructions, etc.)
- **Share Link** — Generate a shareable link for clients to access pricing and booking directly
- **Role-based Access** — Admin (artist) manages everything; clients view pricing and manage their own bookings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Tailwind CSS 4 + Vite 8 |
| Backend | Node.js + Express 5 |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT + bcrypt |
| File Upload | Multer |

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
├── client/                # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   ├── Booking.jsx
│   │   │   ├── Income.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Prices.jsx
│   │   │   ├── Portfolio.jsx
│   │   │   ├── Reviews.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Share.jsx
│   │   ├── components/    # Shared components
│   │   │   ├── BottomNav.jsx
│   │   │   └── NoticeModal.jsx
│   │   ├── api.js         # API client
│   │   └── auth.jsx       # Auth context
│   └── vite.config.js
├── server/                # Express backend
│   ├── index.js           # Entry point
│   ├── db.js              # SQLite setup & schema
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── makeup.js
│   │   ├── appointments.js
│   │   ├── income.js
│   │   ├── notices.js
│   │   ├── portfolio.js
│   │   ├── reviews.js
│   │   ├── notifications.js
│   │   └── share.js
│   ├── middleware/
│   │   └── auth.js        # JWT middleware
│   └── uploads/           # Uploaded files (gitignored)
└── package.json
```

## License

MIT
