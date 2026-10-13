import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ProviderRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  // ========================================
  // HANDLE REGISTER
  // ========================================

  const handleRegister = (e) => {
    e.preventDefault();

    // ========================================
    // CLEAN INPUTS
    // ========================================

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // ========================================
    // NAME VALIDATION
    // ========================================

    if (!cleanName) {
      alert("Please enter your full name ❌");
      return;
    }

    if (cleanName.length < 2) {
      alert(
        "Full name must be at least 2 characters ❌"
      );
      return;
    }

    // ========================================
    // EMAIL VALIDATION
    // ========================================

    if (!cleanEmail) {
      alert(
        "Please enter a valid email address ❌"
      );
      return;
    }

    // ========================================
    // PASSWORD VALIDATION
    // ========================================

    if (password.length < 6) {
      alert(
        "Password must be at least 6 characters ❌"
      );
      return;
    }

    // ========================================
    // CONFIRM PASSWORD
    // ========================================

    if (password !== confirmPassword) {
      alert(
        "Passwords do not match ❌"
      );
      return;
    }

    // ========================================
    // PROTECTED ADMIN EMAIL
    // ========================================

    if (
      cleanEmail ===
      "admin@khadamatx.com"
    ) {
      alert(
        "This email is reserved for the administrator ❌"
      );
      return;
    }

    // ========================================
    // GET EXISTING USERS
    // ========================================

    let users = [];

    try {
      const savedUsers =
        localStorage.getItem("users");

      if (savedUsers) {
        const parsedUsers =
          JSON.parse(savedUsers);

        if (Array.isArray(parsedUsers)) {
          users = parsedUsers.filter(
            (user) =>
              user &&
              typeof user === "object" &&
              !Array.isArray(user)
          );
        }
      }
    } catch (error) {
      console.error(
        "Users data error:",
        error
      );

      users = [];
    }

    // ========================================
    // CHECK DUPLICATE EMAIL
    // ========================================

    const existingUser = users.find(
      (user) => {
        const userEmail = String(
          user.email || ""
        )
          .trim()
          .toLowerCase();

        return userEmail === cleanEmail;
      }
    );

    if (existingUser) {
      alert(
        "An account with this email already exists ❌"
      );
      return;
    }

    // ========================================
    // CREATE PROVIDER
    // ========================================

    const newProvider = {
      id: Date.now(),
      name: cleanName,
      email: cleanEmail,
      password,
      role: "provider",
      createdAt:
        new Date().toISOString(),
    };

    // ========================================
    // SAVE PROVIDER
    // ========================================

    users.push(newProvider);

    localStorage.setItem(
      "users",
      JSON.stringify(users)
    );

    // ========================================
    // REMOVE OLD LOGIN STATE
    // ========================================

    localStorage.removeItem(
      "isLoggedIn"
    );

    // Registration is not login.
    // Do not keep provider as current user.
    localStorage.removeItem("user");

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
      "Provider registration successful! ✅"
    );

    // ========================================
    // GO TO LOGIN
    // ========================================

    navigate("/login");
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* ========================================
            LOGO
        ======================================== */}

        <div className="auth-logo">
          <span>K</span>hadamatX
        </div>

        <p className="auth-label">
          BECOME A SERVICE PROVIDER
        </p>

        <h1>
          Join as a Provider
        </h1>

        <p className="auth-subtitle">
          Create your provider account and start
          offering your services on KhadamatX.
        </p>

        {/* ========================================
            REGISTER FORM
        ======================================== */}

        <form onSubmit={handleRegister}>

          {/* FULL NAME */}

          <div className="form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              autoComplete="name"
              required
            />

          </div>

          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
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
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="new-password"
              minLength={6}
              required
            />

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="form-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              autoComplete="new-password"
              minLength={6}
              required
            />

          </div>

          {/* ========================================
              PROVIDER INFO
          ======================================== */}

          <div
            style={{
              marginBottom: "18px",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "#151515",
              border: "1px solid #292929",
              color: "#aaa",
              fontSize: "13px",
              lineHeight: "1.6",
            }}
          >
            🧑‍💻 This registration creates a{" "}

            <strong
              style={{
                color: "#ff7a00",
              }}
            >
              Provider
            </strong>{" "}

            account.

            <br />

            You will be able to offer services and
            manage customer orders.
          </div>

          {/* ========================================
              REGISTER
          ======================================== */}

          <button
            type="submit"
            className="auth-submit-btn"
          >
            Create Provider Account →
          </button>

        </form>

        {/* ========================================
            LOGIN
        ======================================== */}

        <p className="auth-footer">

          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>

        </p>

        {/* ========================================
            CUSTOMER REGISTER
        ======================================== */}

        <p
          style={{
            marginTop: "10px",
            textAlign: "center",
            fontSize: "13px",
            color: "#888",
          }}
        >
          Looking for services?{" "}

          <Link
            to="/register"
            style={{
              color: "#ff7a00",
              textDecoration: "none",
            }}
          >
            Create Customer Account
          </Link>

        </p>

      </div>

    </div>
  );
}

export default ProviderRegister;