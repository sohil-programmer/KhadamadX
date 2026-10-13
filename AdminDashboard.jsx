import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    customers: 0,
    providers: 0,
    services: 0,
    orders: 0,
    completed: 0,
    pending: 0,
    totalReviews: 0,
    averageRating: "0.0",
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
  });

  // ========================================
  // LOAD STATS
  // ========================================

  const loadStats = () => {
    // USERS
    let users = [];

    try {
      users =
        JSON.parse(
          localStorage.getItem("users")
        ) || [];
    } catch {
      users = [];
    }

    const currentUser = (() => {
      try {
        return JSON.parse(
          localStorage.getItem("user")
        );
      } catch {
        return null;
      }
    })();

    const allUsers = [...users];

    if (
      currentUser &&
      currentUser.email &&
      !allUsers.some(
        (user) =>
          user.email === currentUser.email
      )
    ) {
      allUsers.push(currentUser);
    }

    const customers = allUsers.filter(
      (user) =>
        (user.role || "customer") === "customer"
    );

    const providers = allUsers.filter(
      (user) =>
        user.role === "provider"
    );

    // ========================================
    // SERVICES
    // ========================================

    let providerServices = [];

    try {
      providerServices =
        JSON.parse(
          localStorage.getItem(
            "providerServices"
          )
        ) || [];
    } catch {
      providerServices = [];
    }

    const defaultServices = [
      "Web Development",
      "Graphic Design",
      "Mobile App Development",
      "Digital Marketing",
      "Video Editing",
      "Computer Services",
    ];

    const services =
      defaultServices.length +
      providerServices.length;

    // ========================================
    // ORDERS
    // ========================================

    let orders = [];

    try {
      const savedOrders =
        localStorage.getItem("orders");

      console.log(
        "ADMIN DASHBOARD ORDERS:",
        savedOrders
      );

      if (savedOrders) {
        const parsedOrders =
          JSON.parse(savedOrders);

        if (Array.isArray(parsedOrders)) {
          orders = parsedOrders;
        }
      }
    } catch (error) {
      console.error(
        "Orders loading error:",
        error
      );

      orders = [];
    }

    console.log(
      "ADMIN ORDERS ARRAY:",
      orders
    );

    const completed = orders.filter(
      (order) =>
        order.status === "Completed"
    );

    const pending = orders.filter(
      (order) =>
        order.status === "Pending"
    );

    // ========================================
    // REVIEWS
    // ========================================

    const reviews = orders.filter(
      (order) =>
        order.reviewed === true ||
        Number(order.rating || 0) > 0
    );

    const totalReviews =
      reviews.length;

    const averageRating =
      totalReviews > 0
        ? (
            reviews.reduce(
              (sum, order) =>
                sum +
                Number(
                  order.rating || 0
                ),
              0
            ) / totalReviews
          ).toFixed(1)
        : "0.0";

    const fiveStar =
      reviews.filter(
        (order) =>
          Number(order.rating) === 5
      ).length;

    const fourStar =
      reviews.filter(
        (order) =>
          Number(order.rating) === 4
      ).length;

    const threeStar =
      reviews.filter(
        (order) =>
          Number(order.rating) === 3
      ).length;

    // ========================================
    // UPDATE
    // ========================================

    setStats({
      users: allUsers.length,
      customers: customers.length,
      providers: providers.length,

      services: services,

      orders: orders.length,
      completed: completed.length,
      pending: pending.length,

      totalReviews: totalReviews,
      averageRating: averageRating,
      fiveStar: fiveStar,
      fourStar: fourStar,
      threeStar: threeStar,
    });
  };

  // ========================================
  // EVENTS
  // ========================================

  useEffect(() => {
    loadStats();

    window.addEventListener(
      "ordersUpdated",
      loadStats
    );

    window.addEventListener(
      "authChange",
      loadStats
    );

    window.addEventListener(
      "servicesUpdated",
      loadStats
    );

    window.addEventListener(
      "storage",
      loadStats
    );

    return () => {
      window.removeEventListener(
        "ordersUpdated",
        loadStats
      );

      window.removeEventListener(
        "authChange",
        loadStats
      );

      window.removeEventListener(
        "servicesUpdated",
        loadStats
      );

      window.removeEventListener(
        "storage",
        loadStats
      );
    };
  }, []);

  return (
    <div className="admin-page">

      {/* HEADER */}

      <div className="admin-header">

        <div>
          <span className="admin-label">
            KHADAMATX ADMIN
          </span>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Manage your marketplace from one place.
          </p>
        </div>

        <div className="admin-actions">

          <Link
            to="/admin/services"
            className="admin-manage-btn"
          >
            Manage Services
          </Link>

          <Link
            to="/"
            className="admin-home-btn"
          >
            ← Back to Website
          </Link>

        </div>

      </div>

      {/* MAIN STATS */}

      <div className="admin-stats">

        <div className="admin-card">
          <span>👥</span>
          <h3>{stats.users}</h3>
          <p>Total Users</p>
        </div>

        <div className="admin-card">
          <span>👤</span>
          <h3>{stats.customers}</h3>
          <p>Customers</p>
        </div>

        <div className="admin-card">
          <span>🧑‍💻</span>
          <h3>{stats.providers}</h3>
          <p>Providers</p>
        </div>

        <div className="admin-card">
          <span>🛍️</span>
          <h3>{stats.services}</h3>
          <p>Services</p>
        </div>

        <div className="admin-card">
          <span>📦</span>
          <h3>{stats.orders}</h3>
          <p>Total Orders</p>
        </div>

        <div className="admin-card">
          <span>⏳</span>
          <h3>{stats.pending}</h3>
          <p>Pending Orders</p>
        </div>

        <div className="admin-card">
          <span>✅</span>
          <h3>{stats.completed}</h3>
          <p>Completed Orders</p>
        </div>

      </div>

      {/* REVIEWS */}

      <div className="admin-reviews-stats">

        <div className="review-stat-card">
          <span>⭐</span>
          <h3>{stats.averageRating}</h3>
          <p>Average Rating</p>
        </div>

        <div className="review-stat-card">
          <span>⭐⭐⭐⭐⭐</span>
          <h3>{stats.fiveStar}</h3>
          <p>5 Star Reviews</p>
        </div>

        <div className="review-stat-card">
          <span>⭐⭐⭐⭐</span>
          <h3>{stats.fourStar}</h3>
          <p>4 Star Reviews</p>
        </div>

        <div className="review-stat-card">
          <span>⭐⭐⭐</span>
          <h3>{stats.threeStar}</h3>
          <p>3 Star Reviews</p>
        </div>

        <div className="review-stat-card">
          <span>💬</span>
          <h3>{stats.totalReviews}</h3>
          <p>Total Reviews</p>
        </div>

      </div>

      {/* MANAGEMENT */}

      <div className="admin-management">

        <h2>Management</h2>

        <div className="admin-management-grid">

          <div className="admin-action-card">
            <span>👥</span>
            <h3>Users</h3>

            <p>
              Manage customers, providers
              and administrators.
            </p>

            <Link
              to="/admin/users"
              className="admin-manage-btn"
            >
              Manage Users
            </Link>
          </div>

          <div className="admin-action-card">
            <span>🛍️</span>
            <h3>Services</h3>

            <p>
              Review and manage marketplace
              services.
            </p>

            <Link
              to="/admin/services"
              className="admin-manage-btn"
            >
              Manage Services
            </Link>
          </div>

          <div className="admin-action-card">
            <span>📦</span>
            <h3>Orders</h3>

            <p>
              Monitor and manage all customer
              orders.
            </p>

            <Link
              to="/admin/orders"
              className="admin-manage-btn"
            >
              Manage Orders
            </Link>
          </div>

          <div className="admin-action-card">
            <span>⭐</span>
            <h3>Reviews</h3>

            <p>
              Monitor customer reviews
              and ratings.
            </p>

            <Link
              to="/admin/reviews"
              className="admin-manage-btn"
            >
              Manage Reviews
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;