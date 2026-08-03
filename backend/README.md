# Connectly Backend

A Node.js/Express + MySQL backend for the Connectly meeting/collaboration platform
(the React/Vite frontend in `project1-main`). Covers authentication (login, signup,
OTP, 2FA, password reset, JWT refresh), users, meetings, notifications, recordings,
chat messages, and a WebSocket realtime channel matching the frontend's `rtmService.js`.

## 1. Requirements

- Node.js 18+
- MySQL 8.0 (matches what you're already running for DriveEase)

## 2. Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your MySQL credentials (`DB_USER`, `DB_PASSWORD`) and two long
random strings for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

Create the schema:

```bash
npm run migrate
```

This runs `sql/schema.sql`, which creates the `connectly` database and all tables
(users, refresh_tokens, auth_codes, meetings, meeting_participants, recordings,
messages, files, notifications, analytics_events, audit_log).

Load the same demo data the frontend ships with (11 users, 12 meetings, 9
notifications, 15 messages) straight into MySQL:

```bash
npm run seed
```

Every seeded user gets the same demo password: **`Connectly@123`**
(e.g. `alex@connectly.com` / `Connectly@123`).

## 3. Run

```bash
npm run dev     # nodemon, auto-restarts on file changes
# or
npm start
```

Server starts on `http://localhost:5000` by default, with the WebSocket endpoint
at `ws://localhost:5000/ws`.

## 4. API overview

All routes are prefixed with `/api` and return JSON in the shape `{ data: ... }`
(or `{ token, refreshToken, user }` for auth), matching what `authService.js`,
`meetingService.js`, `notificationService.js`, `recordingService.js`, and
`userService.js` in the frontend already expect.

| Area | Routes |
|---|---|
| Auth | `POST /auth/signup`, `POST /auth/login`, `POST /auth/verify-otp`, `POST /auth/2fa/verify`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/refresh`, `GET /auth/profile`, `POST /auth/logout` |
| Users | `GET /users`, `GET /users/online`, `GET /users/departments`, `GET /users/:id`, `PUT /users/:id` |
| Meetings | `GET /meetings`, `GET /meetings/:id`, `POST /meetings`, `PUT /meetings/:id`, `DELETE /meetings/:id` |
| Notifications | `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all`, `DELETE /notifications/:id` |
| Recordings | `GET /recordings`, `GET /recordings/:id`, `PUT /recordings/:id`, `DELETE /recordings/:id` |
| Messages | `GET /messages?with=<userId>` or `?channel=<id>`, `POST /messages` |

Every route except `/auth/*` requires `Authorization: Bearer <token>`.

## 5. Realtime (WebSocket)

Connect to `ws://localhost:5000/ws?token=<jwt>`. Messages are JSON `{ type, payload }`,
matching `src/services/rtmService.js` in the frontend. Supported `type`s:
`join_meeting`, `leave_meeting`, `chat_message`, `direct_message`, `presence`,
`webrtc_signal` (for forwarding SDP/ICE signaling during a call).

To point the frontend at this instead of the placeholder `wss://api.connectly.dev/ws`,
set in the frontend:

```js
window.__ENV__ = { API_URL: 'http://localhost:5000/api', REALTIME_URL: 'ws://localhost:5000/ws' };
```

(e.g. in `index.html` before the app script loads, or via a small config file), and
add a Vite proxy for `/api` -> `http://localhost:5000` in `vite.config.js` for local dev.

## 6. Notes / next steps

- **Auth wiring**: `authController.js` implements the full login -> OTP -> 2FA flow
  the frontend's UI already has screens for. The frontend's `AuthContext.jsx`
  currently authenticates entirely against the local `users.json` + localStorage;
  swapping it to call `authService.js` (which already targets these exact endpoints)
  is the one remaining integration step to go fully live.
- **Real OTP/reset delivery**: OTP codes and password-reset tokens are currently
  logged to the server console (`[DEV ONLY]`) instead of emailed/texted. Wire up
  an email/SMS provider (e.g. SendGrid, Twilio) before production use.
- **File uploads**: `multer` is included as a dependency for handling file-share
  uploads (`files` table is already in the schema) but no upload route is wired
  up yet — add one if/when the Files feature needs real storage.
- **Security**: rotate `JWT_SECRET`/`JWT_REFRESH_SECRET` and your MySQL password
  before deploying, and never commit the real `.env` file.
