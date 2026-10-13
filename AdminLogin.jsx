import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ========================================
  // ADMIN CREDENTIALS
  // ========================================
  // NOTE:
  // This is only for the current localStorage
  // prototype. Production must use backend auth.

  const ADMIN_EMAIL = "admin@khadamatx.com";
  const ADMIN_PASSWORD = "admin123";

  // ========================================
  // HANDLE ADMIN LOGIN
  // ========================================

  const handleAdminLogin = (e) => {
    e.preventDefault();

    const enteredEmail =
      email.trim().toLowerCase();

    // ========================================
    // VALIDATION
    // ========================================

    if (!enteredEmail || !password) {
      alert(
        "Please enter admin email and password."
      );
      return;
    }

    // ========================================
    // CHECK ADMIN CREDENTIALS
    // ========================================

    if (
      enteredEmail !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    ) {
      alert(
        "Invalid Admin Email or Password ❌"
      );
      return;
    }

    // ========================================
    // CREATE ADMIN USER
    // ========================================

    const admin = {
      id: "admin",
      name: "KhadamatX Admin",
      email: ADMIN_EMAIL,
      role: "admin",
    };

    // ========================================
    // SAVE ADMIN SESSION
    // ========================================

    localStorage.setItem(
      "user",
      JSON.stringify(admin)
    );

    localStorage.setItem(
      "isLoggedIn",
      "true"
    );

    // ========================================
    // AUTH EVENT
    // ========================================

    window.dispatchEvent(
      new Event("authChange")
    );

    // ========================================
    // SUCCESS
    // ========================================

    alert(
      "Admin Login Successful 👑"
    );

    // ========================================
    // ADMIN DASHBOARD
    // ========================================

    navigate("/admin");
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* ========================================
            LEFT SIDE
        ======================================== */}

        <div className="login-info">

          <div className="logo">
            K
          </div>

          <h1>
            Admin Panel
          </h1>

          <p>
            Secure administrator access to
            KhadamatX.
          </p>

          <div className="login-line"></div>

          <span>
            Manage • Monitor • Control
          </span>

        </div>

        {/* ========================================
            RIGHT SIDE
        ======================================== */}

        <div className="login-form">

          <h2>
            🔐 Admin Login
          </h2>

          <p className="subtitle">
            Login to manage KhadamatX
          </p>

          <form onSubmit={handleAdminLogin}>

            {/* EMAIL */}

            <div className="form-group">

              <label>
                Admin Email
              </label>

              <input
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
                required
              />

            </div>

            {/* PASSWORD */}

            <div className="form-group">

              <label>
                Admin Password
              </label>

              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                required
              />

            </div>

            {/* LOGIN */}

            <button
              type="submit"
              className="login-button"
            >
              🔐 Login as Admin
            </button>

          </form>

          {/* ========================================
              BACK TO USER LOGIN
          ======================================== */}

          <p className="register-link">

            <Link to="/login">
              ← Back to User Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default AdminLogin;