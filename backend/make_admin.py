import sqlite3
import sys
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / 'app' / 'database' / 'database.db'

VALID_ROLES = ['admin', 'analyst', 'viewer', 'user']


def get_all_users() -> None:
    if not DB_PATH.exists():
        print("❌ Database not found. Start backend first: python run.py")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    try:
        users = conn.execute(
            "SELECT id, username, email, role, is_active FROM users ORDER BY role, username"
        ).fetchall()

        if not users:
            print("ℹ️  No users found in database.")
            return

        print("=" * 70)
        print(f"  {'ID':<5} {'Username':<20} {'Email':<30} {'Role':<10} {'Status'}")
        print("=" * 70)

        for u in users:
            status = "Active" if u['is_active'] else "Inactive"
            print(f"  {u['id']:<5} {u['username']:<20} {u['email']:<30} {u['role']:<10} {status}")

        print("=" * 70)
        print(f"  Total: {len(users)} user(s)")

    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    finally:
        conn.close()


def change_role(email: str, new_role: str) -> None:
    if not DB_PATH.exists():
        print("❌ Database not found. Start backend first: python run.py")
        return

    if new_role not in VALID_ROLES:
        print(f"❌ Invalid role '{new_role}'. Valid roles: {', '.join(VALID_ROLES)}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    try:
        user = conn.execute(
            "SELECT id, username, role, is_active FROM users WHERE email = ?",
            (email,)
        ).fetchone()

        if not user:
            print(f"❌ No user found with email: {email}")
            return

        old_role = user['role']

        if old_role == new_role:
            print(f"ℹ️  {user['username']} ({email}) is already '{new_role}'.")
            return

        conn.execute(
            "UPDATE users SET role = ?, is_active = 1 WHERE email = ?",
            (new_role, email)
        )
        conn.commit()

        role_levels = {'admin': 3, 'analyst': 2, 'viewer': 1, 'user': 0}
        if role_levels[new_role] > role_levels[old_role]:
            action = "Promoted"
        else:
            action = "Demoted"

        print("=" * 50)
        print(f"✅ {action} successfully.")
        print(f"   Username : {user['username']}")
        print(f"   Email    : {email}")
        print(f"   Role     : {old_role} → {new_role}")
        print("=" * 50)
        print("   User must log out and log back in to apply.")

    except sqlite3.Error as e:
        conn.rollback()
        print(f"❌ Database error: {e}")
    finally:
        conn.close()


def print_usage() -> None:
    print("""
Usage: python make_admin.py <command> [arguments]

Commands:
  list                          Show all users and their roles
  promote <email>               Promote user to admin
  demote  <email>               Demote admin back to user
  role    <email> <role>        Set any role (admin, analyst, viewer, user)

Examples:
  python make_admin.py list
  python make_admin.py promote someone@email.com
  python make_admin.py demote  someone@email.com
  python make_admin.py role    someone@email.com analyst
""")


if __name__ == '__main__':
    args = sys.argv[1:]

    if not args:
        print_usage()
        sys.exit(0)

    command = args[0].lower()

    if command == 'list':
        get_all_users()

    elif command == 'promote':
        if len(args) < 2:
            print("❌ Usage: python make_admin.py promote user@email.com")
        else:
            change_role(args[1], 'admin')

    elif command == 'demote':
        if len(args) < 2:
            print("❌ Usage: python make_admin.py demote user@email.com")
        else:
            change_role(args[1], 'user')

    elif command == 'role':
        if len(args) < 3:
            print("❌ Usage: python make_admin.py role user@email.com <role>")
            print(f"   Valid roles: {', '.join(VALID_ROLES)}")
        else:
            change_role(args[1], args[2])

    else:
        print(f"❌ Unknown command: '{command}'")
        print_usage()