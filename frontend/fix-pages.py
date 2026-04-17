import re
from pathlib import Path

# LOGIN
login_path = Path("app/auth/login/page.tsx")
login = login_path.read_text(encoding="utf-8")

if "import { Navbar }" not in login:
    login = login.replace(
        "import { useAuthStore } from '../../../lib/store/auth.store';",
        "import { useAuthStore } from '../../../lib/store/auth.store';\nimport { Navbar } from '../../../components/layout/Navbar';"
    )

login = login.replace(
    'return (\n    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">',
    'return (\n    <>\n      <Navbar />\n      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4 bg-gray-50">'
)

login = login.rstrip()
login = re.sub(r'    </div>\n  \);\n\}$', '    </div>\n    </>\n  );\n}', login)

login = login.replace(
    "setServerError(err.response?.data?.error || 'Identifiants invalides');",
    "setServerError(err.response?.data?.error || \Identifiants invalides\);"
)

login_path.write_text(login, encoding="utf-8")
print("Login OK")

# REGISTER
register_path = Path("app/auth/register/page.tsx")
register = register_path.read_text(encoding="utf-8")

if "import { Navbar }" not in register:
    register = register.replace(
        "import { authApi } from '../../../lib/api';",
        "import { authApi } from '../../../lib/api';\nimport { Navbar } from '../../../components/layout/Navbar';"
    )

register = register.replace(
    "setServerError(err.response?.data?.error || 'Erreur lors de l\'inscription');",
    "setServerError(err.response?.data?.error || \Erreur lors de l'inscription\);"
)

register = register.replace(
    'return (\n      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">',
    'return (\n      <>\n        <Navbar />\n        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4 bg-gray-50">'
)

register = register.replace(
    'return (\n    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">',
    'return (\n    <>\n      <Navbar />\n      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4 bg-gray-50">'
)

register_path.write_text(register, encoding="utf-8")
print("Register OK")

# HOME
home_path = Path("app/page.tsx")
home = home_path.read_text(encoding="utf-8")

if "import { Navbar }" not in home:
    home = home.replace(
        "import Link from 'next/link';",
        "import Link from 'next/link';\nimport { Navbar } from '../components/layout/Navbar';"
    )

if "<Navbar />" not in home:
    home = home.replace("<main>", "<>\n      <Navbar />\n      <main>", 1)

home_path.write_text(home, encoding="utf-8")
print("Home OK")

print("Tout est applique. Relancez npm run dev")
