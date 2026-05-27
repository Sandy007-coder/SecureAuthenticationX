# SecureAuthX — Enterprise Secure Authentication Platform

> A professional, cybersecurity-themed authentication dashboard built with React + Vite + Tailwind CSS.

---

## 🖥️ Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Framework | React 18                |
| Build     | Vite 6                  |
| Styling   | Tailwind CSS 3          |
| Routing   | React Router DOM 7      |
| HTTP      | Axios                   |
| Icons     | Lucide React            |

---

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── AlertBanner.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── LoginActivityTable.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── SecurityCard.jsx
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── AdminPanel.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   ├── Profile.jsx
│   │   └── Register.jsx
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ (tested on v24.16.0)
- npm

### Installation

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The app starts at **http://localhost:3000**

---

## 🔗 Backend API

Set your backend URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### API Endpoints Used

| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| POST   | /api/auth/register          | Register new user    |
| POST   | /api/auth/login             | Authenticate user    |
| POST   | /api/auth/logout            | End session          |
| GET    | /api/auth/profile           | Get user profile     |
| GET    | /api/admin/stats            | Admin statistics     |
| GET    | /api/admin/logs             | Security event logs  |
| GET    | /api/admin/locked-accounts  | Locked accounts list |

> The frontend uses **HTTP-only cookie authentication** — cookies are set and read by the server, not JavaScript.

---

## 🔐 Authentication Flow

1. User submits credentials on `/login`
2. Backend sets an HTTP-only cookie
3. Axios sends the cookie automatically (`withCredentials: true`)
4. On app load, `GET /api/auth/profile` verifies session
5. Protected routes redirect unauthenticated users to `/login`
6. Admin routes additionally require `user.role === 'admin'`

---

## 📄 Pages

| Route        | Access  | Description                  |
|--------------|---------|------------------------------|
| `/login`     | Public  | Email/password authentication |
| `/register`  | Public  | New account creation          |
| `/dashboard` | Auth    | Security overview dashboard   |
| `/profile`   | Auth    | User account details          |
| `/admin`     | Admin   | System-wide admin panel       |
| `/*`         | Public  | 404 Not Found page            |

---

## 🎨 Design System

- **Theme**: Dark cybersecurity — deep navy background with neon blue accents
- **Cards**: Glassmorphism (`backdrop-blur` + semi-transparent backgrounds)
- **Fonts**: Orbitron (display) · Sora (body) · JetBrains Mono (code/data)
- **Colors**: `cyber-bg`, `cyber-blue`, `cyber-green`, `cyber-red`, `cyber-yellow`

---

## 🛠️ Build for Production

```bash
npm run build
npm run preview
```

---

## 📝 Notes

- Mock data is used as a fallback when the backend is not running
- All mock data is visible in Dashboard and AdminPanel immediately
- The app is fully functional for UI review without a running backend
