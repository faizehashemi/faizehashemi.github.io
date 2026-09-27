"""Print the SQL that creates a desk login — used once to create the first admin.

    python tools/make_desk.py <name> <makkah|medina> <desk|viewer|admin>

Asks for the password (not echoed), then prints an INSERT to paste into the D1 console
(Cloudflare dashboard → D1 → your database → Console) or to run with
`npx wrangler d1 execute pms --remote --command "<sql>"`.
Hashing matches worker/worker.js: PBKDF2-SHA256, 100 000 iterations, 16-byte salt.
All further desks are easier to create from the PMS Setup page as that admin.
"""
import datetime
import getpass
import hashlib
import os
import sys

if len(sys.argv) != 4 or sys.argv[2] not in ("makkah", "medina") or sys.argv[3] not in ("desk", "viewer", "admin"):
    sys.exit(__doc__)
name, site, role = sys.argv[1:]
pw = getpass.getpass(f"Password for {name}: ")
if len(pw) < 8 or pw != getpass.getpass("Again: "):
    sys.exit("Passwords must match and be at least 8 characters.")
salt = os.urandom(16)
iterations = 100000
digest = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, iterations, dklen=32)
esc = name.replace("'", "''")
print(
    "INSERT INTO desks (name, site, role, pw_hash, pw_salt, pw_iter, created_at) VALUES "
    f"('{esc}', '{site}', '{role}', '{digest.hex()}', '{salt.hex()}', {iterations}, "
    f"'{datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')}');"
)
