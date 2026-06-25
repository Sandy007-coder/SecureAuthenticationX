# REAL-TIME AI THREAT DETECTION & RESPONSE PLATFORM

### Powered by SecureAuthenticationX

> An enterprise-grade cybersecurity platform featuring secure authentication, role-based access control, real-time security monitoring, SOC analyst dashboard, and AI-driven threat detection — built as a Final Year Cybersecurity Project.

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0.3-000000?style=for-the-badge&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

## 📌 Overview

This platform combines a **production-grade authentication system** with a **Security Operations Center (SOC) dashboard** — demonstrating real-world cybersecurity engineering skills across the full stack.

| What it does | How |
|---|---|
| Secure user authentication | JWT + bcrypt + HTTP-only cookies |
| Real-time threat monitoring | Security event logs + audit trail |
| Incident investigation | MITRE ATT&CK mapping + forensic timeline |
| Role-based access control | Admin / Analyst / Viewer / User hierarchy |
| Account protection | Rate limiting + lockout + suspicious login detection |
| SOC analyst workflow | Alert triage → Investigation → Resolution |

---

## 🏗️ Architecture

```
User Login Request
        ↓
Rate Limiter (Flask-Limiter)
        ↓
Input Validation (validators.py)
        ↓
bcrypt Password Verification
        ↓
JWT Token Generation (30 min access)
        ↓
HTTP-only Cookie (XSS protected)
        ↓
Role-Based Route Access (RBAC)
        ↓
React SOC Dashboard
        ↓
SOC Analyst Response
```

---

## 🛠️ Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Framework | Python 3.11+, Flask 3.0.3 |
| Database | SQLite3 (WAL mode) |
| Authentication | PyJWT 2.8.0, bcrypt 4.1.3 |
| Security | Flask-Limiter, Flask-CORS, Security Headers |
| Config | python-dotenv |
| Server | Gunicorn (production) |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 18.3.1 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3.4 |
| Routing | React Router DOM 7 |
| HTTP Client | Axios 1.7.9 |
| Icons | Lucide React |

---

## 📁 Project Structure

```
SecureAuthenticationX/
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth_routes.py        # Register, Login, Logout, Profile, Password
│   │   │   └── admin_routes.py       # Stats, Logs, Users, Roles, Unlock
│   │   ├── middleware/
│   │   │   ├── auth_middleware.py    # JWT verification + dual token extraction
│   │   │   └── admin_middleware.py   # RBAC — role hierarchy enforcement
│   │   ├── utils/
│   │   │   ├── token_utils.py        # JWT access + refresh token management
│   │   │   ├── logger.py             # Structured JSON audit logging
│   │   │   ├── password_utils.py     # bcrypt hashing + strength scoring
│   │   │   └── validators.py         # Input validation for all entities
│   │   ├── database/
│   │   │   ├── db.py                 # SQLite connection + schema + migration
│   │   │   └── database.db           # SQLite database (gitignored)
│   │   ├── logs/                     # JSON audit logs (gitignored)
│   │   └── __init__.py               # App factory + security config
│   ├── seed_admin.py                 # Create/promote default admin account
│   ├── make_admin.py                 # CLI tool for user role management
│   ├── .env                          # Secrets (gitignored)
│   ├── .env.example                  # Safe template for environment setup
│   ├── .gitignore
│   ├── requirements.txt
│   └── run.py                        # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AlertBanner.jsx        # Dismissible alert notifications
    │   │   ├── LoadingSpinner.jsx     # Animated loading states
    │   │   ├── LoginActivityTable.jsx # Sortable security event table
    │   │   ├── Navbar.jsx             # Top navigation + notifications
    │   │   ├── ProtectedRoute.jsx     # Auth + RBAC route guard
    │   │   ├── SecurityCard.jsx       # Metric cards with neon styling
    │   │   └── Sidebar.jsx            # Navigation sidebar
    │   ├── pages/
    │   │   ├── AdminPanel.jsx         # Admin control center
    │   │   ├── Alerts.jsx             # Alert center with search/filter/sort
    │   │   ├── AlertDetails.jsx       # Forensic incident investigation
    │   │   ├── Dashboard.jsx          # Security analytics overview
    │   │   ├── Login.jsx              # Secure authentication page
    │   │   ├── NotFound.jsx           # 404 page
    │   │   ├── Profile.jsx            # Profile editing + password change
    │   │   ├── Register.jsx           # Account registration
    │   │   └── SecuritySettings.jsx   # MFA, IP allowlist, login alerts
    │   ├── services/
    │   │   └── api.js                 # Axios API client
    │   ├── styles/
    │   │   └── global.css             # Design system + Tailwind base
    │   ├── App.jsx                    # Auth context + routing
    │   └── main.jsx                   # React entry point
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── postcss.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm 9+

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/SecureAuthenticationX.git
cd SecureAuthenticationX
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate        # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env          # Windows
cp .env.example .env            # Mac/Linux
# Open .env and fill in your secret keys

# Start the backend server
python run.py
```

Backend runs at: `http://127.0.0.1:5000`  
Health check: `http://127.0.0.1:5000/health`

### 3. Create Admin Account

```bash
# Open a new terminal — backend must be running first
cd backend
venv\Scripts\activate
python seed_admin.py
```

### 4. Frontend Setup

```bash
# Open a new terminal
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` folder:

```env
# Flask
FLASK_ENV=development
FLASK_DEBUG=false

# Secrets — generate with: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your-flask-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
JWT_REFRESH_SECRET_KEY=your-refresh-secret-key

# Token Expiry
ACCESS_TOKEN_EXPIRY_MINUTES=30
REFRESH_TOKEN_EXPIRY_DAYS=7

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Rate Limiting
RATELIMIT_STORAGE_URI=memory://
```

> ⚠️ Never commit your `.env` file. It is already in `.gitignore`.

---

## 🔐 Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt with 12 rounds work factor |
| Token authentication | JWT access tokens (30 min) + refresh tokens (7 days) |
| Cookie security | HTTP-only, Secure, SameSite=Strict |
| Account lockout | 5 failed attempts → 15 min lockout |
| Rate limiting | 10 requests/min on login + register |
| Role-based access | Admin → Analyst → Viewer → User hierarchy |
| SQL injection prevention | Parameterized queries throughout |
| Security headers | CSP, HSTS, X-Frame-Options, COOP, CORP |
| Audit logging | Structured JSON logs to file + database |
| Input validation | Server-side validation on all endpoints |
| Inactive account check | Deactivated users blocked at token level |
| Reverse proxy support | X-Forwarded-For IP resolution |

---

## 🌐 API Reference

### Auth Routes `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register new account | No |
| POST | `/login` | Authenticate + issue JWT cookie | No |
| POST | `/logout` | Clear session cookie | JWT |
| GET | `/profile` | Get current user profile | JWT |
| PATCH | `/profile` | Update username/email | JWT |
| POST | `/change-password` | Change account password | JWT |

### Admin Routes `/api/admin`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/stats` | Platform statistics + alert breakdown | Admin |
| GET | `/logs` | Paginated + filterable audit logs | Admin |
| GET | `/locked-accounts` | Currently locked accounts | Admin |
| POST | `/unlock/<user_id>` | Unlock a locked account | Admin |
| GET | `/users` | List all registered users | Admin |
| PATCH | `/users/<id>/role` | Update user role | Admin |
| PATCH | `/users/<id>/status` | Activate/deactivate account | Admin |

---

## 📊 Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Secure authentication with lockout feedback |
| `/register` | Public | Account creation with password strength meter |
| `/dashboard` | Auth | Security analytics overview |
| `/alerts` | Auth | Alert center with search, filter, and sort |
| `/alerts/:id` | Auth | Forensic investigation — timeline, MITRE ATT&CK, evidence |
| `/profile` | Auth | Edit profile, change password, MFA settings |
| `/security-settings` | Auth | MFA, IP allowlisting, login alert preferences |
| `/admin` | Admin | Control panel — users, logs, locked accounts |
| `/*` | Public | 404 Not Found |

---

## 👥 Role System

| Role | Dashboard | Alerts | Admin Panel | User Management |
|---|---|---|---|---|
| **Admin** | ✅ Full stats | ✅ | ✅ | ✅ |
| **Analyst** | ✅ | ✅ | ❌ | ❌ |
| **Viewer** | ✅ | ✅ Read-only | ❌ | ❌ |
| **User** | ✅ Basic | ❌ | ❌ | ❌ |

---

## 🛠️ Admin CLI Tools

### Seed Default Admin

```bash
python seed_admin.py
```

### Manage User Roles

```bash
# List all users
python make_admin.py list

# Promote to admin
python make_admin.py promote user@email.com

# Demote to user
python make_admin.py demote user@email.com

# Set specific role
python make_admin.py role user@email.com analyst
```

---

## 🎨 Design System

- **Theme** — Dark cybersecurity aesthetic, deep navy + neon blue accents
- **Cards** — Glassmorphism with backdrop blur + neon glow shadows
- **Fonts** — Orbitron (display) · Sora (body) · JetBrains Mono (code/data)
- **Colors** — `cyber-bg` · `cyber-blue` · `cyber-green` · `cyber-red` · `cyber-yellow`
- **Animations** — Fade in, slide up, neon glow, pulse ring, CRT scan overlay

---

## 🏭 Production Deployment

```bash
# Backend — run with Gunicorn
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 run:app

# Frontend — build for production
cd frontend
npm run build
npm run preview
```

---

## 📂 Database Schema

| Table | Purpose |
|---|---|
| `users` | Accounts, roles, login state, lockout tracking |
| `security_logs` | Full audit trail of all security events |
| `alerts` | Security incidents with severity + status |
| `alert_notes` | Analyst investigation notes per alert |
| `refresh_tokens` | JWT refresh token management + revocation |

---

## 🔄 Fresh Setup After Clone

```bash
# Terminal 1 — Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Fill in .env with secret keys
python run.py

# Terminal 2 — Seed Admin (run once)
cd backend
venv\Scripts\activate
python seed_admin.py

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev
```

---

## 👨‍💻 Author

**Sarveswaran S**  

* B.Tech — Computer Science & Engineering (Cybersecurity)
* 🔐 Cybersecurity, Python & Data Analytics Enthusiast
* 🎯 Interested in Penetration Testing, Red Teaming, and Data Analysis

🔗 GitHub: https://github.com/Sandy007-coder

🔗 LinkedIn: (https://www.linkedin.com/in/sarveswaran-cybersec?utm_source=share_via&utm_content=profile&utm_medium=member_android)

---

<div align="center">

Built with ❤️ for cybersecurity — demonstrating enterprise-level authentication and SOC operations.

</div>
