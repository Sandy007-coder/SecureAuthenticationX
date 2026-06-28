import sqlite3
import bcrypt
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / 'app' / 'database' / 'database.db'

ADMIN_EMAIL    = 'sarveswarans620@gmail.com' # Change Email each time 
ADMIN_USERNAME = 'Sarveswaran'
ADMIN_PASSWORD = 'Sarveswaran9361@'  # Change Password each time 

def seed_admin() -> None:
    if not DB_PATH.exists():
        print("❌ Database not found. Start backend first: python run.py")
        return

    hashed = bcrypt.hashpw(ADMIN_PASSWORD.encode(), bcrypt.gensalt(rounds=12)).decode()
    conn   = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    try:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?", (ADMIN_EMAIL,)
        ).fetchone()

        if existing:
            conn.execute(
                """
                UPDATE users
                SET role = 'admin', password = ?, username = ?, is_active = 1
                WHERE email = ?
                """,
                (hashed, ADMIN_USERNAME, ADMIN_EMAIL),
            )
            print(f"✅ Promoted to admin: {ADMIN_EMAIL}")
        else:
            conn.execute(
                """
                INSERT INTO users (username, email, password, role, failed_attempts, is_active)
                VALUES (?, ?, ?, 'admin', 0, 1)
                """,
                (ADMIN_USERNAME, ADMIN_EMAIL, hashed),
            )
            print(f"✅ Admin account created: {ADMIN_EMAIL}")

        conn.commit()
        print("   Log out and log back in to apply changes.")

    except sqlite3.Error as e:
        conn.rollback()
        print(f"❌ Database error: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    print("=" * 50)
    print("  SecureAuthenticationX — Admin Seeder")
    print("=" * 50)
    seed_admin()