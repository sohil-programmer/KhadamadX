import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ========================================
  // HANDLE LOGIN
  // ========================================

  const handleLogin = (e) => {
    e.preventDefault();

    const enteredEmail = email.trim().toLowerCase();
    const enteredPassword = password;

    // ========================================
    // BASIC VALIDATION
    // ========================================

    if (!enteredEmail || !enteredPassword) {
      alert("Please enter your email and password.");
      return;
    }

    // ========================================
    // ADMIN LOGIN
    // ========================================
    // NOTE:
    // This is okay for the current demo/localStorage
    // version only. Production must use backend auth.

    if (
      enteredEmail === "admin@khadamatx.com" &&
      enteredPassword === "admin123"
    ) {
      const admin = {
        id: "admin",
        name: "KhadamatX Admin",
        email: "admin@khadamatx.com",
        role: "admin",
      };

      localStorage.setItem(
        "user",
        JSON.stringify(admin)
      );

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      window.dispatchEvent(
        new Event("authChange")
      );

      alert("Welcome Admin 👑");

      navigate("/admin");

      return;
    }

    // ========================================
    // GET USERS
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
            (item) =>
              item &&
              typeof item === "object" &&
              !Array.isArray(item)
          );
        }
      }
    } catch (error) {
      console.error(
        "Users data error:",
        error
      );
    }

    // ========================================
    // BACKWARD COMPATIBILITY
    // ========================================

    const oldUserData =
      localStorage.getItem("user");

    if (users.length === 0 && oldUserData) {
      try {
        const oldUser =
          JSON.parse(oldUserData);

        if (
          oldUser &&
          typeof oldUser === "object" &&
          oldUser.email
        ) {
          users = [oldUser];
        }
      } catch (error) {
        console.error(
          "Old user data error:",
          error
        );
      }
    }

    // ========================================
    // FIND USER
    // ========================================

    const foundUser = users.find(
      (user) => {
        const userEmail =
          String(user.email || "")
            .trim()
            .toLowerCase();

        return (
          userEmail === enteredEmail &&
          user.password === enteredPassword
        );
      }
    );

    // ========================================
    // USER NOT FOUND
    // ========================================

    if (!foundUser) {
      alert(
        "Email or Password is incorrect ❌"
      );

      return;
    }

    // ========================================
    // NORMALIZE ROLE
    // ========================================

    const normalizedRole = String(
      foundUser.role || "customer"
    )
      .trim()
      .toLowerCase();

    // ========================================
    // CREATE CURRENT USER
    // ========================================

    const currentUser = {
      ...foundUser,
      role: normalizedRole,
    };

    // ========================================
    // SAVE CURRENT USER
    // ========================================

    localStorage.setItem(
      "user",
      JSON.stringify(currentUser)
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
    // WELCOME MESSAGE
    // ========================================

    alert(
      `Welcome ${
        currentUser.name || "User"
      } 👋`
    );

    // ========================================
    // ROLE REDIRECT
    // ========================================

    if (normalizedRole === "provider") {
      navigate("/provider-dashboard");
      return;
    }

    if (normalizedRole === "admin") {
      navigate("/admin");
      return;
    }

    // ========================================
    // DEFAULT = CUSTOMER
    // ========================================

    navigate("/dashboard");
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
            Welcome Back!
          </h1>

          <p>
            Login to continue your journey
            with KhadamatX.
          </p>

          <div className="login-line"></div>

          <span>
            Find • Offer • Connect
          </span>

        </div>

        {/* ========================================
            RIGHT SIDE
        ======================================== */}

        <div className="login-form">

          <h2>
            Login
          </h2>

          <p className="subtitle">
            Sign in to your account
          </p>

          <form onSubmit={handleLogin}>

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
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                required
              />

            </div>

            {/* FORGOT PASSWORD */}

            <div className="forgot">
              <span>
                Forgot Password?
              </span>
            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
            >
              Login
            </button>

          </form>

          {/* ========================================
              CUSTOMER REGISTER
          ======================================== */}

          <p className="register-link">

            Don't have an account?

            {" "}

            <Link to="/register">
              Register
            </Link>

          </p>

          {/* ========================================
              PROVIDER REGISTER
          ======================================== */}

          <p
            style={{
              marginTop: "12px",
              textAlign: "center",
              fontSize: "14px",
              color: "#999",
            }}
          >
            Want to offer your services?{" "}

            <Link
              to="/provider-register"
              style={{
                color: "#ff7a00",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Become a Provider
            </Link>

          </p>

          {/* ========================================
              ADMIN LOGIN
          ======================================== */}

          <div className="admin-login-section">

            <div className="admin-divider">
              <span>
                OR
              </span>
            </div>

            <button
              type="button"
              className="admin-login-button"
              onClick={() =>
                navigate("/admin-login")
              }
            >
              🔐 Admin Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;