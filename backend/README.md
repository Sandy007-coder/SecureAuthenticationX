# SecureAuthX

A professional, enterprise-style secure authentication backend built with Python and Flask.  
Designed as a Final Year Cybersecurity Project — lightweight, clean, and production-ready.

---

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Backend        | Python, Flask                       |
| Database       | SQLite3                             |
| Auth           | PyJWT, bcrypt, HTTP-only cookies    |
| Security       | Flask-Limiter, Flask-CORS, headers  |
| Config         | python-dotenv                       |

---

## Project Structure

```
backend/
├── app/
│   ├── routes/
│   │   ├── auth_routes.py       # Register, Login, Logout, Profile
│   │   └── admin_routes.py      # Stats, Logs, Locked Accounts
│   ├── middleware/
│   │   ├── auth_middleware.py   # JWT verification decorator
│   │   └── admin_middleware.py  # Admin role check decorator
│   ├── utils/
│   │   ├── token_utils.py       # JWT generate/verify
│   │   ├── logger.py            # Audit logging (file + DB)
│   │   ├── password_utils.py    # bcrypt hash/verify
│   │   └── validators.py        # Input validation
│   ├── database/
│   │   ├── db.py                # SQLite connection + init
│   │   └── database.db          # SQLite database file
│   ├── logs/
│   │   └── security.log         # Audit log file
│   └── __init__.py              # App factory
├── .env                         # Secret keys
├── .gitignore
├── requirements.txt
└── run.py                       # Entry point
```

---

## Setup & Run

```bash
# 1. Create and activate virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the server
python run.py
```

Server runs at: `http://127.0.0.1:5000`

---

## API Endpoints

### Auth Routes (`/api/auth`)

| Method | Endpoint               | Description              | Auth Required |
|--------|------------------------|--------------------------|---------------|
| POST   | `/register`            | Register a new user      | No            |
| POST   | `/login`               | Login and get JWT cookie | No            |
| POST   | `/logout`              | Clear auth cookie        | Yes (JWT)     |
| GET    | `/profile`             | Get current user profile | Yes (JWT)     |

### Admin Routes (`/api/admin`)

| Method | Endpoint               | Description              | Auth Required     |
|--------|------------------------|--------------------------|-------------------|
| GET    | `/stats`               | Platform statistics      | Yes (Admin JWT)   |
| GET    | `/logs`                | Security audit logs      | Yes (Admin JWT)   |
| GET    | `/locked-accounts`     | Locked user accounts     | Yes (Admin JWT)   |

---

## Security Features

- **bcrypt** password hashing with auto-generated salt
- **JWT** tokens stored in HTTP-only cookies (XSS protection)
- **Account lockout** after 5 failed attempts (15 min duration)
- **Rate limiting** on login and register endpoints
- **Parameterized SQLite queries** (SQL injection prevention)
- **Security headers** on every response (CSP, X-Frame-Options, HSTS, etc.)
- **Audit logging** to file and database
- **Input validation** for username, email, and password

---

## Default Roles

- `user` — standard authenticated user
- `admin` — access to admin dashboard APIs

To promote a user to admin, update their role directly in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'youremail@example.com';
```

---

## Environment Variables (`.env`)

```
SECRET_KEY=your-flask-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
```
