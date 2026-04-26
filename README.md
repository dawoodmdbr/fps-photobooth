# FPS Photobooth

**Fast Photography Society — FAST-NUCES Faisalabad**

A web app where students log in with their university email and view/download their official photograph. Admins can batch-upload, update, and delete photos.

---

## Tech Stack

- **Frontend**: React + Vite → deployed on Vercel
- **Auth**: Firebase Authentication (Google OAuth)
- **Backend**: Express.js → deployed on Render
- **Storage**: Cloudinary (25GB free, permanent)

---

## Features

**Student**
- Sign in with university Google account (`@cfd.nu.edu.pk`)
- Automatically fetches their own photo using their roll number
- Preview their official university photograph
- One-click download in original high resolution

**Admin**
- Sign in with any whitelisted email (not restricted to university domain)
- Batch upload hundreds of photos at once via drag & drop
- Photos are automatically mapped to students by filename (`24f3053.jpg`)
- Update any student's photo individually
- Delete any student's photo
- Search students by roll number

**General**
- No manual roll number entry — parsed automatically from email
- Supports `.jpg`, `.jpeg`, `.png`, `.webp` formats
- Persistent cloud storage via Cloudinary (no data loss on server restart)
- Fully responsive on mobile and desktop

---

## Project Structure

```
fps-photobooth/
├── src/
│   ├── firebase/
│   │   └── config.js          # Firebase Auth initialization
│   ├── hooks/
│   │   └── useAuth.jsx        # Auth context & provider
│   ├── pages/
│   │   ├── LoginPage.jsx      # Google sign-in
│   │   ├── StudentPage.jsx    # Photo view & download
│   │   └── AdminPage.jsx      # Admin management panel
│   ├── utils/
│   │   └── rollParser.js      # Email → roll → filename utilities
│   ├── App.jsx                # Router
│   ├── main.jsx               # Entry point
│   └── index.css              # All styles
├── server/
│   └── index.js               # Express backend (Cloudinary API)
├── .env.local                 # Firebase config (gitignored, never commit)
├── .env.example               # Template for env variables
└── vite.config.js
```


---

## 📸 Screenshots

### Login Page
<p align="center">
  <img width="1919" height="914" alt="image" src="https://github.com/user-attachments/assets/24eaa7fc-5a5e-4b5c-827c-960a3a747495" />
</p>

### Student view
<p align="center">
  <img width="1919" height="914" alt="image" src="https://github.com/user-attachments/assets/d1c01f26-86ee-41f3-a171-3bc7b460c0b7" />
</p>

### Admin view
<p align="center">
  <img width="1906" height="914" alt="image" src="https://github.com/user-attachments/assets/768b5920-04bc-48be-8a9a-0f69c37312b6" />
</p>

---

## Local Development

### 1. Clone and install

```bash
# Frontend
cd fps-photobooth
npm install

# Backend
cd server
npm install
```

### 2. Firebase setup

1. Go to [Firebase Console](https://console.firebase.google.com) → Create project
2. Enable **Authentication** → Sign-in method → **Google**
3. Add `localhost` to authorized domains (should be there by default)

### 3. Frontend env variables

Copy `.env.example` to `.env.local` and fill in your Firebase values:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Find these in Firebase Console → Project Settings → Your apps → Web app.

### 4. Cloudinary setup

Sign up at [cloudinary.com](https://cloudinary.com) (free). Get your credentials from the Dashboard.

Create `server/.env` with:

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CORS_ORIGIN=http://localhost:5173
```

### 5. Set admin emails

Edit **one file only** — `src/utils/rollParser.js`:

```js
export const ADMIN_EMAILS = [
  "youremail@gmail.com",
  // add more admins — any email works, not just university emails
];
```

### 6. Run locally

```bash
# Terminal 1 — Backend (http://localhost:3001)
cd server
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd fps-photobooth
npm run dev
```

---

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set root directory to `server`
4. Build command: `npm install`
5. Start command: `node index.js`
6. Add environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   CORS_ORIGIN=https://your-app.vercel.app
   PORT=  (Render sets this automatically)
   ```
7. Deploy → copy the service URL (e.g. `https://fps-backend.onrender.com`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
2. Root directory: `fps-photobooth`
3. Add environment variables (same as `.env.local`)
4. Deploy

### After deploying both

Update `API` in `src/pages/StudentPage.jsx` and `src/pages/AdminPage.jsx`:

```js
const API = "https://fps-backend.onrender.com"; // your Render URL
```

Add your Vercel domain to Firebase Console → Authentication → Settings → Authorized domains.

---

## How Photos Are Stored

Photos are stored in Cloudinary under the folder `fps-photobooth/`.

Filename format: `24f3053` (lowercase, no dash, no extension — Cloudinary handles format)

**Email → Roll → Filename:**

| Email | Roll Number | Cloudinary ID |
|-------|-------------|---------------|
| f243053@cfd.nu.edu.pk | 24F-3053 | fps-photobooth/24f3053 |
| f231001@cfd.nu.edu.pk | 23F-1001 | fps-photobooth/23f1001 |

---

## Admin Batch Upload

1. Name all photos like: `24f3053.jpg`, `23f1001.jpg` (lowercase, no dash)
2. Log in with an admin email
3. Go to Admin Panel → Batch Upload
4. Drag & drop or select all files
5. Click Upload — photos go directly to Cloudinary

---

## Add Your Logo

Replace the SVG camera placeholder in:
- `src/pages/LoginPage.jsx` → `.login-logo-placeholder`
- `src/pages/StudentPage.jsx` and `src/pages/AdminPage.jsx` → `.header-logo-placeholder`

Drop your logo at `public/logo.png` and replace the SVG with:
```jsx
<img src="/logo.png" alt="FPS Logo" width="32" height="32" />
```
