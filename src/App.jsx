import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import "./App.css";

// ========================================
// CUSTOMER / PUBLIC
// ========================================

import Dashboard from "./Dashboard";
import Login from "./Login";
import Register from "./Register";
import Services from "./Services";
import ServiceDetails from "./ServiceDetails";
import Order from "./Order";

import About from "./About";
import Contact from "./Contact";

// ========================================
// PROVIDER
// ========================================

import ProviderDashboard from "./ProviderDashboard";
import ProviderRegister from "./ProviderRegister";
import ProviderProfile from "./ProviderProfile";
import OfferService from "./OfferService";
import MyServices from "./MyServices";
import EditService from "./EditService";
import EditProfile from "./EditProfile";

// ========================================
// ADMIN
// ========================================

import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminServices from "./AdminServices";
import AdminOrders from "./AdminOrders";
import AdminReviews from "./AdminReviews";
import AdminLogin from "./AdminLogin";

// ========================================
// SYSTEM
// ========================================

import ProtectedRoute from "./ProtectedRoute";
import Notifications from "./Notifications";

// =====================================================
// SAFE JSON HELPER
// =====================================================

const readJSON = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return fallback;
    }

    const parsed = JSON.parse(saved);

    return parsed;
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);

    return fallback;
  }
};

// =====================================================
// NORMALIZE EMAIL
// =====================================================

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

// =====================================================
// GET CURRENT USER
// =====================================================

const getCurrentUser = () => {
  const user = readJSON("user", null);

  if (!user || typeof user !== "object") {
    return null;
  }

  return user;
};

// =====================================================
// HOME
// =====================================================

function Home({ isLoggedIn, role }) {
  const [featuredProviders, setFeaturedProviders] =
    useState([]);

  useEffect(() => {
    const loadProviders = () => {
      try {
        const users = readJSON("users", []);
        const providerServices = readJSON(
          "providerServices",
          []
        );

        if (
          !Array.isArray(users) ||
          !Array.isArray(providerServices)
        ) {
          setFeaturedProviders([]);
          return;
        }

        const providers = users
          .filter(
            (user) =>
              String(user?.role || "")
                .trim()
                .toLowerCase() === "provider"
          )
          .map((provider) => {
            const providerEmail =
              normalizeEmail(provider.email);

            const services =
              providerServices.filter((service) => {
                const serviceEmail =
                  normalizeEmail(
                    service?.email
                  );

                const serviceProviderEmail =
                  normalizeEmail(
                    service?.providerEmail
                  );

                return (
                  serviceEmail ===
                    providerEmail ||
                  serviceProviderEmail ===
                    providerEmail
                );
              });

            return {
              ...provider,
              services,
              serviceCount:
                services.length,
            };
          })
          .filter(
            (provider) =>
              provider.serviceCount > 0
          )
          .slice(0, 4);

        setFeaturedProviders(providers);
      } catch (error) {
        console.error(
          "Failed to load providers:",
          error
        );

        setFeaturedProviders([]);
      }
    };

    loadProviders();

    window.addEventListener(
      "storage",
      loadProviders
    );

    window.addEventListener(
      "servicesUpdated",
      loadProviders
    );

    window.addEventListener(
      "authChange",
      loadProviders
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadProviders
      );

      window.removeEventListener(
        "servicesUpdated",
        loadProviders
      );

      window.removeEventListener(
        "authChange",
        loadProviders
      );
    };
  }, []);

  return (
    <>
      {/* =================================================
          HERO
      ================================================= */}

      <main className="hero">
        <div className="hero-content">
          <div className="hero-label">
            <span className="hero-dot"></span>
            WELCOME TO KHADAMATX
          </div>

          <h1>
            Your Need,
            <br />
            <span>Our Service.</span>
          </h1>

          <p className="hero-description">
            Find trusted services, connect with skilled
            professionals, and get your work done easily.
          </p>

          {/* SEARCH */}

          <div className="hero-search">
            <input
              type="text"
              placeholder="What service are you looking for?"
              readOnly
              onClick={() => {
                window.location.href =
                  "/services";
              }}
            />

            <Link
              to="/services"
              className="search-btn"
            >
              Search
            </Link>
          </div>

          {/* BUTTONS */}

          <div className="hero-buttons">
            <Link
              to="/services"
              className="primary-btn"
            >
              Find a Service →
            </Link>

            {isLoggedIn &&
            role === "provider" ? (
              <Link
                to="/offer-service"
                className="secondary-btn"
              >
                Offer Your Service
              </Link>
            ) : (
              <Link
                to="/provider-register"
                className="secondary-btn"
              >
                Become a Provider
              </Link>
            )}
          </div>

          {/* TRUST */}

          <div className="hero-trust">
            <span>✓ Easy to Use</span>
            <span>✓ Skilled Providers</span>
            <span>✓ Online Services</span>
          </div>
        </div>

        {/* SERVICE CARD */}

        <div className="service-card">
          <div className="service-card-glow"></div>

          <div className="service-icon">
            ⚡
          </div>

          <p className="card-label">
            KHADAMATX MARKETPLACE
          </p>

          <h2>
            Professional
            <br />
            Services
          </h2>

          <p>
            Website Development, Design, Programming,
            Translation, CV & More.
          </p>

          <div className="available">
            <span></span>

            <strong>
              Available Services
            </strong>
          </div>

          <div className="card-mini-stats">
            <div>
              <strong>24/7</strong>
              <span>Online</span>
            </div>

            <div>
              <strong>100%</strong>
              <span>Practical</span>
            </div>

            <div>
              <strong>Easy</strong>
              <span>Booking</span>
            </div>
          </div>
        </div>
      </main>

      {/* =================================================
          STATS
      ================================================= */}

      <section className="home-stats">
        <div className="stat-item">
          <strong>100+</strong>
          <span>Services</span>
        </div>

        <div className="stat-item">
          <strong>50+</strong>
          <span>Providers</span>
        </div>

        <div className="stat-item">
          <strong>200+</strong>
          <span>Orders</span>
        </div>

        <div className="stat-item">
          <strong>24/7</strong>
          <span>Support</span>
        </div>
      </section>

      {/* =================================================
          HOW KHADAMATX WORKS
      ================================================= */}

      <section className="how-it-works">
        <div className="section-title">
          <p>SIMPLE PROCESS</p>

          <h2>
            How KhadamatX Works
          </h2>

          <span>
            Getting your work done is simple, fast, and secure.
          </span>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">
              01
            </div>

            <div className="step-icon">
              🔎
            </div>

            <h3>
              Find a Service
            </h3>

            <p>
              Search and choose the service that matches
              your needs.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">
              02
            </div>

            <div className="step-icon">
              🛒
            </div>

            <h3>
              Place an Order
            </h3>

            <p>
              Select your service, provide your details,
              and place your order.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">
              03
            </div>

            <div className="step-icon">
              👨‍💻
            </div>

            <h3>
              Provider Works
            </h3>

            <p>
              A skilled provider works on your project
              and prepares the final result.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">
              04
            </div>

            <div className="step-icon">
              ✅
            </div>

            <h3>
              Get Delivered
            </h3>

            <p>
              Your completed project is reviewed and
              delivered to your account.
            </p>
          </div>
        </div>
      </section>

      {/* =================================================
          POPULAR SERVICES
      ================================================= */}

      <section className="services-preview">
        <div className="section-title">
          <p>WHAT WE OFFER</p>

          <h2>
            Popular Services
          </h2>

          <span>
            Choose a service and get started today.
          </span>
        </div>

        <div className="service-grid">
          <div className="service-box">
            <div className="box-icon">
              💻
            </div>

            <h3>
              Web Development
            </h3>

            <p>
              Modern and responsive websites for
              businesses and individuals.
            </p>

            <Link to="/services">
              Explore Service →
            </Link>
          </div>

          <div className="service-box">
            <div className="box-icon">
              🎨
            </div>

            <h3>
              Graphic Design
            </h3>

            <p>
              Logos, posters, business cards and
              social media designs.
            </p>

            <Link to="/services">
              Explore Service →
            </Link>
          </div>

          <div className="service-box">
            <div className="box-icon">
              📄
            </div>

            <h3>
              CV & Documents
            </h3>

            <p>
              Professional CVs, typing, PDF conversion
              and documents.
            </p>

            <Link to="/services">
              Explore Service →
            </Link>
          </div>

          <div className="service-box">
            <div className="box-icon">
              🌐
            </div>

            <h3>
              Translation
            </h3>

            <p>
              High-quality translation services for
              different languages.
            </p>

            <Link to="/services">
              Explore Service →
            </Link>
          </div>
        </div>

        {/* =================================================
            FEATURED PROVIDERS
        ================================================= */}

        <section className="featured-providers">
          <div className="section-title">
            <p>
              TRUSTED PROFESSIONALS
            </p>

            <h2>
              Featured Providers
            </h2>

            <span>
              Meet skilled professionals ready to work on your project.
            </span>
          </div>

          {featuredProviders.length > 0 ? (
            <div className="providers-grid">
              {featuredProviders.map(
                (provider) => {
                  const providerName =
                    provider.name ||
                    provider.fullName ||
                    "Provider";

                  const firstLetter =
                    providerName
                      .charAt(0)
                      .toUpperCase();

                  const providerServices =
                    provider.services || [];

                  const skills = [
                    ...new Set(
                      providerServices
                        .map(
                          (service) =>
                            service.category
                        )
                        .filter(Boolean)
                    ),
                  ].slice(0, 3);

                  return (
                    <div
                      className="provider-card"
                      key={
                        provider.id ||
                        provider.email
                      }
                    >
                      <div className="provider-avatar">
                        {firstLetter}
                      </div>

                      <div className="provider-info">
                        <h3>
                          {providerName}
                        </h3>

                        <span className="provider-role">
                          {provider.title ||
                            provider.profession ||
                            "Service Provider"}
                        </span>

                        <div className="provider-rating">
                          ⭐ 5.0

                          <span>
                            •{" "}
                            {
                              providerServices.length
                            }{" "}
                            Service
                            {providerServices.length !==
                            1
                              ? "s"
                              : ""}
                          </span>
                        </div>
                      </div>

                      <div className="provider-skills">
                        {skills.length > 0 ? (
                          skills.map(
                            (
                              skill,
                              index
                            ) => (
                              <span
                                key={
                                  index
                                }
                              >
                                {skill}
                              </span>
                            )
                          )
                        ) : (
                          <span>
                            Professional Services
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/provider/${encodeURIComponent(
                          provider.email
                        )}`}
                        className="provider-view-btn"
                      >
                        View Profile →
                      </Link>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="no-providers">
              <div className="no-providers-icon">
                👨‍💻
              </div>

              <h3>
                No Featured Providers Yet
              </h3>

              <p>
                Skilled providers will appear here after they
                register and publish their services.
              </p>

              <Link
                to="/provider-register"
                className="primary-btn"
              >
                Become a Provider →
              </Link>
            </div>
          )}

          <div className="view-all-providers">
            <Link to="/services">
              Explore All Services →
            </Link>
          </div>
        </section>

        <div className="view-all-services">
          <Link to="/services">
            View All Services →
          </Link>
        </div>
      </section>

      {/* =================================================
          PROVIDER CTA
      ================================================= */}

      <section className="provider-cta">
        <div>
          <p>HAVE A SKILL?</p>

          <h2>
            Turn Your Skills Into Income.
          </h2>

          <span>
            Join KhadamatX as a provider and start
            offering your services online.
          </span>
        </div>

        <Link
          to={
            isLoggedIn &&
            role === "provider"
              ? "/offer-service"
              : "/provider-register"
          }
        >
          {isLoggedIn &&
          role === "provider"
            ? "Offer a Service →"
            : "Become a Provider →"}
        </Link>
      </section>
    </>
  );
}

// =====================================================
// MAIN APP
// =====================================================

function App() {
  // ========================================
  // MOBILE MENU
  // ========================================

  const [menuOpen, setMenuOpen] =
    useState(false);

  // ========================================
  // LOGIN STATE
  // ========================================

  const [isLoggedIn, setIsLoggedIn] =
    useState(() => {
      return (
        localStorage.getItem(
          "isLoggedIn"
        ) === "true"
      );
    });

  // ========================================
  // USER ROLE
  // ========================================

  const [role, setRole] =
    useState(() => {
      const user = getCurrentUser();

      if (!user) {
        return null;
      }

      return String(
        user.role || "customer"
      )
        .trim()
        .toLowerCase();
    });

  // ========================================
  // NOTIFICATION COUNT
  // ========================================

  const [unreadCount, setUnreadCount] =
    useState(0);

  // ========================================
  // LOAD AUTH
  // ========================================

  useEffect(() => {
    const updateAuth = () => {
      const loggedIn =
        localStorage.getItem(
          "isLoggedIn"
        ) === "true";

      setIsLoggedIn(loggedIn);

      const user = getCurrentUser();

      if (!user) {
        setRole(null);
        return;
      }

      setRole(
        String(
          user.role || "customer"
        )
          .trim()
          .toLowerCase()
      );
    };

    updateAuth();

    window.addEventListener(
      "authChange",
      updateAuth
    );

    window.addEventListener(
      "storage",
      updateAuth
    );

    window.addEventListener(
      "profileUpdated",
      updateAuth
    );

    return () => {
      window.removeEventListener(
        "authChange",
        updateAuth
      );

      window.removeEventListener(
        "storage",
        updateAuth
      );

      window.removeEventListener(
        "profileUpdated",
        updateAuth
      );
    };
  }, []);

  // ========================================
  // LOAD USER-SPECIFIC NOTIFICATIONS
  // ========================================

  useEffect(() => {
    const updateUnreadCount = () => {
      try {
        const notifications = readJSON(
          "notifications",
          []
        );

        const currentUser =
          getCurrentUser();

        if (
          !Array.isArray(
            notifications
          ) ||
          !currentUser?.email
        ) {
          setUnreadCount(0);
          return;
        }

        const currentEmail =
          normalizeEmail(
            currentUser.email
          );

        const unread =
          notifications.filter(
            (notification) => {
              const notificationEmail =
                normalizeEmail(
                  notification?.email
                );

              return (
                notificationEmail ===
                  currentEmail &&
                notification?.read !== true
              );
            }
          ).length;

        setUnreadCount(unread);
      } catch (error) {
        console.error(
          "Failed to load notification count:",
          error
        );

        setUnreadCount(0);
      }
    };

    updateUnreadCount();

    window.addEventListener(
      "notificationsUpdated",
      updateUnreadCount
    );

    window.addEventListener(
      "storage",
      updateUnreadCount
    );

    window.addEventListener(
      "authChange",
      updateUnreadCount
    );

    return () => {
      window.removeEventListener(
        "notificationsUpdated",
        updateUnreadCount
      );

      window.removeEventListener(
        "storage",
        updateUnreadCount
      );

      window.removeEventListener(
        "authChange",
        updateUnreadCount
      );
    };
  }, []);

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem(
      "isLoggedIn"
    );

    localStorage.removeItem(
      "user"
    );

    setIsLoggedIn(false);
    setRole(null);
    setUnreadCount(0);
    setMenuOpen(false);

    window.dispatchEvent(
      new Event("authChange")
    );

    window.location.href = "/";
  };

  // ========================================
  // CLOSE MENU
  // ========================================

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // ========================================
  // APP
  // ========================================

  return (
    <BrowserRouter>
      <div className="app">

        {/* =================================================
            NAVBAR
        ================================================= */}

        <nav
          className={`navbar ${
            menuOpen
              ? "menu-open"
              : ""
          }`}
        >

          {/* LOGO */}

          <Link
            to="/"
            className="logo"
            onClick={closeMenu}
          >
            <span>K</span>
            hadamatX
          </Link>

          {/* MOBILE BUTTON */}

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() =>
              setMenuOpen(
                (prev) => !prev
              )
            }
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen
              ? "✕"
              : "☰"}
          </button>

          {/* MAIN NAV */}

          <div className="nav-links">

            <Link
              to="/"
              onClick={closeMenu}
            >
              Home
            </Link>

            <Link
              to="/services"
              onClick={closeMenu}
            >
              Services
            </Link>

            <Link
              to="/about"
              onClick={closeMenu}
            >
              About
            </Link>

            <Link
              to="/contact"
              onClick={closeMenu}
            >
              Contact
            </Link>

            {/* CUSTOMER */}

            {isLoggedIn &&
              role === "customer" && (
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              )}

            {/* PROVIDER */}

            {isLoggedIn &&
              role === "provider" && (
                <>
                  <Link
                    to="/provider-dashboard"
                    onClick={closeMenu}
                  >
                    Provider Dashboard
                  </Link>

                  <Link
                    to="/my-services"
                    onClick={closeMenu}
                  >
                    My Services
                  </Link>

                  <Link
                    to="/edit-profile"
                    className="navbar-edit-profile"
                    onClick={closeMenu}
                  >
                    ✏️ Edit Profile
                  </Link>
                </>
              )}

            {/* ADMIN */}

            {isLoggedIn &&
              role === "admin" && (
                <>
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                  >
                    Admin Dashboard
                  </Link>

                  <Link
                    to="/admin/users"
                    onClick={closeMenu}
                  >
                    Users
                  </Link>

                  <Link
                    to="/admin/services"
                    onClick={closeMenu}
                  >
                    Services
                  </Link>

                  <Link
                    to="/admin/orders"
                    onClick={closeMenu}
                  >
                    Orders
                  </Link>
                </>
              )}
          </div>

          {/* RIGHT NAV */}

          <div className="nav-buttons">

            {isLoggedIn ? (
              <>
                {/* CUSTOMER */}

                {role === "customer" && (
                  <Link
                    to="/dashboard"
                    className="login-btn"
                    onClick={closeMenu}
                  >
                    My Orders
                  </Link>
                )}

                {/* PROVIDER */}

                {role === "provider" && (
                  <>
                    <Link
                      to="/provider-dashboard"
                      className="login-btn"
                      onClick={closeMenu}
                    >
                      Orders
                    </Link>

                    <Link
                      to="/offer-service"
                      className="login-btn"
                      onClick={closeMenu}
                    >
                      Offer Service
                    </Link>
                  </>
                )}

                {/* ADMIN */}

                {role === "admin" && (
                  <Link
                    to="/admin"
                    className="login-btn"
                    onClick={closeMenu}
                  >
                    Admin Panel
                  </Link>
                )}

                {/* NOTIFICATIONS */}

                <Link
                  to="/notifications"
                  className="notification-nav"
                  title="Notifications"
                  aria-label={`Notifications${
                    unreadCount > 0
                      ? `, ${unreadCount} unread`
                      : ""
                  }`}
                  onClick={closeMenu}
                >
                  🔔

                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* LOGOUT */}

                <button
                  type="button"
                  className="register-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="login-btn"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="register-btn"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* =================================================
            ROUTES
        ================================================= */}

        <Routes>

          {/* PUBLIC */}

          <Route
            path="/"
            element={
              <Home
                isLoggedIn={
                  isLoggedIn
                }
                role={role}
              />
            }
          />

          <Route
            path="/services"
            element={
              <Services />
            }
          />

          <Route
            path="/services/:id"
            element={
              <ServiceDetails />
            }
          />

          <Route
            path="/provider/:email"
            element={
              <ProviderProfile />
            }
          />

          <Route
            path="/about"
            element={
              <About />
            }
          />

          <Route
            path="/contact"
            element={
              <Contact />
            }
          />

          {/* AUTH */}

          <Route
            path="/register"
            element={
              <Register />
            }
          />

          <Route
            path="/provider-register"
            element={
              <ProviderRegister />
            }
          />

          <Route
            path="/login"
            element={
              <Login />
            }
          />

          <Route
            path="/admin-login"
            element={
              <AdminLogin />
            }
          />

          {/* ORDER */}

          <Route
            path="/order/:service"
            element={
              <ProtectedRoute role="customer">
                <Order />
              </ProtectedRoute>
            }
          />

          {/* CUSTOMER */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="customer">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* PROVIDER */}

          <Route
            path="/provider-dashboard"
            element={
              <ProtectedRoute role="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/offer-service"
            element={
              <ProtectedRoute role="provider">
                <OfferService />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-services"
            element={
              <ProtectedRoute role="provider">
                <MyServices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-service/:id"
            element={
              <ProtectedRoute role="provider">
                <EditService />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute role="provider">
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* NOTIFICATIONS */}

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/services"
            element={
              <ProtectedRoute role="admin">
                <AdminServices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute role="admin">
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute role="admin">
                <AdminReviews />
              </ProtectedRoute>
            }
          />

        </Routes>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="footer">

          <div className="footer-container">

            {/* BRAND */}

            <div className="footer-brand">

              <Link
                to="/"
                className="footer-logo"
              >
                <span>K</span>
                hadamatX
              </Link>

              <p>
                Your Need, Our Service.
              </p>

              <span className="footer-description">
                Find trusted services, connect with skilled
                professionals, and get your work done easily.
              </span>
            </div>

            {/* QUICK LINKS */}

            <div className="footer-column">

              <h3>
                Quick Links
              </h3>

              <Link to="/">
                Home
              </Link>

              <Link to="/services">
                Services
              </Link>

              <Link to="/about">
                About
              </Link>

              <Link to="/contact">
                Contact
              </Link>

            </div>

            {/* CUSTOMERS */}

            <div className="footer-column">

              <h3>
                For Customers
              </h3>

              <Link to="/services">
                Find a Service
              </Link>

              <Link to="/register">
                Create Account
              </Link>

              <Link to="/login">
                Customer Login
              </Link>

            </div>

            {/* PROVIDERS */}

            <div className="footer-column">

              <h3>
                For Providers
              </h3>

              <Link to="/provider-register">
                Become a Provider
              </Link>

              <Link to="/login">
                Provider Login
              </Link>

              <Link to="/offer-service">
                Offer Your Service
              </Link>

            </div>

          </div>

          {/* FOOTER BOTTOM */}

          <div className="footer-bottom">

            <span>
              ©{" "}
              {new Date().getFullYear()}{" "}
              KhadamatX. All rights reserved.
            </span>

            <span>
              Built with ❤️ for better services.
            </span>

          </div>

        </footer>

      </div>
    </BrowserRouter>
  );
}

export default App;