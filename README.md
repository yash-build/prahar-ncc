# 🪖 SHASTRA — NCC Unit Management System

**Smart Hub for Administration, Strength & Training Records for Armies**

A complete, production-ready web application for managing an NCC (National Cadet Corps) unit in India. Built for daily use by ANO and SUO with a clean, discipline-first UI.

---

## ✨ Features

| Module | Description |
|---|---|
| 🧑‍💼 Cadet Registry | Filterable grid of all cadets (SD/SW, rank, year, search) |
| 👤 Cadet Profile | Attendance %, achievements, honor status, ANO message |
| 📊 Attendance | Create sessions, mark cadets, bulk-mark, lock sessions |
| 📢 Notice Board | Priority notices with expiry, ANO/SUO can post |
| ⭐ Honor Board | Public showcase of honored cadets |
| 🔐 Role-Based Auth | ANO (full control) vs SUO (limited operational access) |
| ⚙️ Admin Panel | Register cadets, add achievements, create accounts |

---

## 🏗️ Tech Stack

- **Frontend:** React + Vite + Tailwind CSS v4
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Image Upload:** Cloudinary + Multer
- **Styling:** Tailwind CSS with custom CSS variables

---

## 📁 Project Structure

```
shastra/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/   # Landing, Login, Dashboard, CadetRegistry, etc.
│       ├── components/  # Navbar, CadetCard, NoticeCard, etc.
│       ├── services/    # Axios API calls
│       ├── context/     # AuthContext (global auth state)
│       └── utils/       # Helpers, formatters
│
└── server/          # Node.js backend
    ├── models/      # Mongoose schemas (User, Cadet, AttendanceSession, etc.)
    ├── controllers/ # Business logic
    ├── routes/      # Express routers
    ├── middleware/  # Auth, role, error handler
    └── config/      # DB + Cloudinary config
```

---

## ⚡ Quick Start

### 1. Clone and install

```bash
git clone https://github.com/yourname/shastra.git
cd shastra

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Configure environment

**server/.env**
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/shastra
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed database

```bash
cd server
node scripts/seed.js
```

This creates:
- ANO account: `ano@shastra.ncc` / `ANOpassword@123`
- SUO account: `suo@shastra.ncc` / `SUOpassword@123`
- 10 sample cadets, 3 notices, achievements

### 4. Run the app

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open: `http://localhost:5173`

---

## 🔐 Role Permissions

| Action | ANO | SUO |
|---|:---:|:---:|
| View cadets / notices | ✅ | ✅ |
| Mark attendance | ✅ | ✅ |
| Post notices | ✅ | ✅ |
| Add cadets | ✅ | ❌ |
| Edit cadets | ✅ | ❌ |
| Add achievements | ✅ | ❌ |
| Toggle honor status | ✅ | ❌ |
| Lock attendance sessions | ✅ | ❌ |
| Create user accounts | ✅ | ❌ |
| Delete notices | ✅ | ❌ |

---

## 🚀 Deployment

### Backend → Render

1. Push `server/` to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Build command: `npm install`
4. Start command: `node app.js`
5. Add all env variables from `server/.env`

### Frontend → Vercel

1. Push `client/` to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Framework: Vite
4. Add env variable: `VITE_API_URL=https://your-render-url.onrender.com/api`

---

## 🧪 API Testing (Postman)

**Login:**
```
POST http://localhost:5000/api/auth/login
Body: { "email": "ano@shastra.ncc", "password": "ANOpassword@123" }
```

**Get all cadets:**
```
GET http://localhost:5000/api/cadets
Query params: wing=SD, rank=Sgt, year=2, search=arjun
```

**Create attendance session:**
```
POST http://localhost:5000/api/attendance/sessions
Authorization: Bearer <token>
Body: { "date": "2024-11-15", "sessionLabel": "Morning Parade", "wing": "ALL" }
```

---

## 🧠 NCC Structure Reference

```
Ranks (low → high):
Cadet → L/Cpl → Cpl → Sgt → JUO → SUO

Wings:
SD = Senior Division (Boys)
SW = Senior Wing (Girls)

Attendance Threshold:
≥ 75% = Satisfactory
< 75% = Defaulter (requires ANO action)
```

---

## 📈 Roadmap

- [ ] QR code attendance marking
- [ ] PDF report export (monthly attendance)
- [ ] Cadet self-login (read-only profile view)
- [ ] Alumni tracking module
- [ ] Email notification system

---

## 🤝 Contributing

Built as a real institutional tool. PRs welcome for bug fixes and improvements.

---

**SHASTRA** — Built with discipline. Designed to last.
