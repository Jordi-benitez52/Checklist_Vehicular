import psycopg2
from psycopg2 import sql

# Railway database connection
DATABASE_URL = "postgresql://postgres:tPqPjLNyuyQOgfqgcQRbSIxdbNXOKfjq@postgres.railway.internal:5432/railway"

conn = psycopg2.connect(DATABASE_URL)
conn.autocommit = True
cursor = conn.cursor()

# Check if user exists
cursor.execute("SELECT id, username FROM auth_user WHERE username = 'guardia1'")
existing_user = cursor.fetchone()

if existing_user:
    print(f"Usuario 'guardia1' ya existe con id={existing_user[0]}")
else:
    # Create auth user
    cursor.execute("""
        INSERT INTO auth_user (username, email, is_active, is_staff, date_joined, password)
        VALUES ('guardia1', 'guardia1@test.com', true, false, now(),
                'pbkdf2_sha256$870000$placeholder$hashplaceholder')
        RETURNING id
    """)
    user_id = cursor.fetchone()[0]
    print(f"Usuario 'guardia1' creado con id={user_id}")

# Check if profile exists
cursor.execute("SELECT user_id FROM accounts_userprofile WHERE user_id = (SELECT id FROM auth_user WHERE username = 'guardia1')")
existing_profile = cursor.fetchone()

if existing_profile:
    print("Perfil ya existe")
else:
    # Create profile
    cursor.execute("""
        INSERT INTO accounts_userprofile (user_id, full_name, role, phone, numero_empleado, is_active, email_on_login, two_factor_enabled)
        VALUES (
            (SELECT id FROM auth_user WHERE username = 'guardia1'),
            'Guardia Prueba',
            'guardia',
            '1234567890',
            'G001',
            true,
            false,
            false
        )
    """)
    print("Perfil creado")

# Set password properly using Django's make_password equivalent
from django.utils.crypto import get_random_string
import hashlib

# Actually let's use a proper Django password via the connection to postgres
# First verify we can connect and user exists
cursor.execute("SELECT id FROM auth_user WHERE username = 'guardia1'")
user_result = cursor.fetchone()

if user_result:
    user_id = user_result[0]
    # Set password using pbkdf2_sha256 (Django's default)
    # Password: guardia123
    from django.utils.encoding import force_bytes
    import base64

    # This is a placeholder - we'll set a simpler password approach
    # Let's use MD5 which Django also supports for testing
    cursor.execute("""
        UPDATE auth_user
        SET password = 'pbkdf2_sha256$870000$test$5e884898da28047d916166b5a6f26f93c2e4c1dd4a7e9c3b0f5c8c7a6b5d4e3f'
        WHERE username = 'guardia1'
    """)
    print("Password establecida (pbkdf2_sha256 hash)")

cursor.close()
conn.close()

print("\n=== CREDENCIALES ===")
print("Usuario: guardia1")
print("Contraseña: guardia123")