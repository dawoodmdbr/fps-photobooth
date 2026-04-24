# FPS Photobooth

**Fast Photography Society — FAST-NUCES Faisalabad**

A web app where students log in with their university email and view/download their official photograph. Admins can batch-upload, update, and delete photos.

---

## Tech Stack

- **Frontend**: React + Vite (deploy to Vercel)
- **Auth**: Firebase Authentication (Google OAuth)
- **Storage**: Firebase Storage (private, signed URLs)
- **Database**: Firestore (optional metadata)

---

## Setup

### 1. Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com) → Create project
2. Enable **Authentication** → Sign-in method → **Google**
3. Enable **Firestore Database** (start in production mode)
4. Enable **Storage** (start in production mode)

### 2. Add Firebase Config

Copy your Firebase config from Project Settings → General → Your apps → Web app.

Paste it into `src/firebase/config.js`:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

### 3. Set Admin Emails

Edit **one file only**: `src/utils/rollParser.js`:

```js
export const ADMIN_EMAILS = [
  "youremail@gmail.com",
  // add more admins
];
```

That's the single source of truth. `storage.rules` and `firestore.rules` enforce authentication only — no duplicate list to maintain.

### 4. Deploy Storage Rules

In Firebase Console → Storage → Rules, paste the contents of `storage.rules`.

### 5. Add Your Logo

Replace the SVG camera placeholder in:
- `src/pages/LoginPage.jsx` → `.login-logo-placeholder`
- `src/pages/StudentPage.jsx` and `src/pages/AdminPage.jsx` → `.header-logo-placeholder`

You can simply add an `<img src="/logo.png" />` inside those divs and place your logo in `/public/logo.png`.

### 6. Install & Run

```bash
npm install
npm run dev
```

### 7. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

---

## How Photos Are Stored

Photos go in Firebase Storage under: `photos/`

Filename format: `24f3053.jpg` (lowercase, no dash)
- `24` = batch year
- `f` = Faisalabad campus
- `3053` = roll number

**Student email** `f243053@cfd.nu.edu.pk` → parses to roll `24F-3053` → filename `24f3053`

The system tries `.jpg`, `.jpeg`, `.png`, `.webp` in that order.

---

## Admin Batch Upload

1. Name all photos like: `24f3053.jpg`, `23f1001.jpg`, etc.
2. Log in with an admin email
3. Go to Admin Panel → Batch Upload
4. Drag & drop or select all files
5. Click Upload

---

## Roll Number Format

| Email | Roll Number | Filename |
|-------|-------------|----------|
| f243053@cfd.nu.edu.pk | 24F-3053 | 24f3053 |
| f231001@cfd.nu.edu.pk | 23F-1001 | 23f1001 |

---

## Project Structure

```
src/
├── firebase/
│   └── config.js          # Firebase initialization
├── hooks/
│   └── useAuth.jsx         # Auth context & provider
├── pages/
│   ├── LoginPage.jsx       # Google sign-in
│   ├── StudentPage.jsx     # Photo view & download
│   └── AdminPage.jsx       # Admin management panel
├── utils/
│   └── rollParser.js       # Email → roll → filename utilities
├── App.jsx                 # Router
├── main.jsx                # Entry point
└── index.css               # All styles
```
