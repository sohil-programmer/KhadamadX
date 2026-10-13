import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DeliverProject from "./DeliverProject";
import { createNotification } from "./notificationHelper";

function ProviderDashboard() {
  // ==================================================
  // HELPERS
  // ==================================================

  const readJSON = (key, fallback) => {
    try {
      const saved = localStorage.getItem(key);

      if (!saved) {
        return fallback;
      }

      const parsed = JSON.parse(saved);

      return parsed ?? fallback;
    } catch (error) {
      console.error(`Failed to read ${key}:`, error);
      return fallback;
    }
  };

  const normalizeEmail = (email) =>
    String(email || "")
      .trim()
      .toLowerCase();

  const normalizeStatus = (status) =>
    String(status || "Pending").trim();

  // ==================================================
  // CURRENT USER
  // ==================================================

  const getCurrentUser = () => {
    const user = readJSON("user", null);

    if (
      !user ||
      typeof user !== "object" ||
      Array.isArray(user)
    ) {
      return null;
    }

    return user;
  };

  const user = getCurrentUser();

  const providerEmail = normalizeEmail(user?.email);

  const providerId = String(user?.id || "").trim();

  const providerRole = String(
    user?.role || "customer"
  )
    .trim()
    .toLowerCase();

  // ==================================================
  // PROVIDER OWNERSHIP
  // ==================================================

  const isOwnProviderOrder = useCallback(
    (order) => {
      if (
        !order ||
        typeof order !== "object" ||
        Array.isArray(order)
      ) {
        return false;
      }

      const orderProviderEmail = normalizeEmail(
        order.providerEmail
      );

      const orderProviderId = String(
        order.providerId || ""
      ).trim();

      // ----------------------------------------------
      // REAL PROVIDER OWNERSHIP BY EMAIL
      // ----------------------------------------------

      if (
        providerEmail &&
        orderProviderEmail &&
        orderProviderEmail === providerEmail
      ) {
        return true;
      }

      // ----------------------------------------------
      // REAL PROVIDER OWNERSHIP BY ID
      // ----------------------------------------------

      if (
        providerId &&
        orderProviderId &&
        orderProviderId === providerId
      ) {
        return true;
      }

      // ----------------------------------------------
      // UNASSIGNED PLATFORM ORDERS
      // ----------------------------------------------
      //
      // Orders with providerId = "khadamatx"
      // are platform/default orders.
      //
      // They must NOT automatically belong to
      // every provider.
      //
      // A real providerId or providerEmail must
      // be assigned before the order appears here.
      // ----------------------------------------------

      return false;
    },
    [providerEmail, providerId]
  );

  // ==================================================
  // GET PROVIDER ORDERS
  // ==================================================

  const getProviderOrders = useCallback(() => {
    const allOrders = readJSON("orders", []);

    if (!Array.isArray(allOrders)) {
      return [];
    }

    return allOrders.filter((order) =>
      isOwnProviderOrder(order)
    );
  }, [isOwnProviderOrder]);

  // ==================================================
  // ORDERS STATE
  // ==================================================

  const [orders, setOrders] = useState(
    getProviderOrders
  );

  // ==================================================
  // REFRESH ORDERS
  // ==================================================

  useEffect(() => {
    const refreshOrders = () => {
      setOrders(getProviderOrders());
    };

    window.addEventListener(
      "ordersUpdated",
      refreshOrders
    );

    window.addEventListener(
      "storage",
      refreshOrders
    );

    return () => {
      window.removeEventListener(
        "ordersUpdated",
        refreshOrders
      );

      window.removeEventListener(
        "storage",
        refreshOrders
      );
    };
  }, [getProviderOrders]);

  // ==================================================
  // CUSTOMER NOTIFICATION
  // ==================================================

  const sendStatusNotification = (
    order,
    newStatus
  ) => {
    if (!order) {
      return;
    }

    const customerEmail = normalizeEmail(
      order.customerEmail
    );

    if (!customerEmail) {
      return;
    }

    let title = "";
    let message = "";
    let icon = "🔔";
    let type = "order";

    switch (newStatus) {
      case "Accepted":
        title = "Order Accepted";
        message = `Your order for ${
          order.service || "your service"
        } has been accepted by the provider.`;
        icon = "✅";
        break;

      case "In Progress":
        title = "Work Started";
        message = `Work has started on your ${
          order.service || "project"
        } project.`;
        icon = "🚀";
        break;

      case "Cancelled":
        title = "Order Cancelled";
        message = `Your order for ${
          order.service || "your service"
        } has been cancelled by the provider.`;
        icon = "❌";
        break;

      default:
        return;
    }

    createNotification({
      email: customerEmail,
      title,
      message,
      icon,
      type,
    });
  };

  // ==================================================
  // VALID STATUS TRANSITIONS
  // ==================================================

  const isValidTransition = (
    currentStatus,
    newStatus
  ) => {
    const transitions = {
      Pending: ["Accepted", "Cancelled"],
      Accepted: ["In Progress"],
      "In Progress": [],
      Completed: [],
      Cancelled: [],
    };

    return (
      transitions[currentStatus]?.includes(
        newStatus
      ) || false
    );
  };

  // ==================================================
  // UPDATE ORDER STATUS
  // ==================================================

  const updateStatus = (
    orderId,
    newStatus
  ) => {
    if (!orderId || !newStatus) {
      return;
    }

    const allCurrentOrders = readJSON(
      "orders",
      []
    );

    if (!Array.isArray(allCurrentOrders)) {
      return;
    }

    // ----------------------------------------------
    // FIND ORDER
    // ----------------------------------------------

    const oldOrder = allCurrentOrders.find(
      (order) =>
        String(order?.id) ===
        String(orderId)
    );

    if (!oldOrder) {
      alert("Order not found.");
      return;
    }

    const oldStatus = normalizeStatus(
      oldOrder.status
    );

    // ----------------------------------------------
    // OWNERSHIP CHECK
    // ----------------------------------------------

    if (!isOwnProviderOrder(oldOrder)) {
      alert(
        "You are not authorized to update this order."
      );

      return;
    }

    // ----------------------------------------------
    // STATUS TRANSITION CHECK
    // ----------------------------------------------

    if (
      !isValidTransition(
        oldStatus,
        newStatus
      )
    ) {
      alert(
        `Invalid status change: ${oldStatus} → ${newStatus}`
      );

      return;
    }

    // ----------------------------------------------
    // UPDATE
    // ----------------------------------------------

    const now = new Date().toISOString();

    const updatedAllOrders =
      allCurrentOrders.map((order) => {
        if (
          String(order?.id) !==
          String(orderId)
        ) {
          return order;
        }

        return {
          ...order,
          status: newStatus,
          updatedAt: now,
        };
      });

    // ----------------------------------------------
    // SAVE
    // ----------------------------------------------

    try {
      localStorage.setItem(
        "orders",
        JSON.stringify(updatedAllOrders)
      );
    } catch (error) {
      console.error(
        "Failed to save orders:",
        error
      );

      alert(
        "Could not save order changes."
      );

      return;
    }

    // ----------------------------------------------
    // UPDATED ORDER
    // ----------------------------------------------

    const latestOrder =
      updatedAllOrders.find(
        (order) =>
          String(order?.id) ===
          String(orderId)
      );

    if (latestOrder) {
      try {
        localStorage.setItem(
          "order",
          JSON.stringify(latestOrder)
        );
      } catch (error) {
        console.error(
          "Failed to save latest order:",
          error
        );
      }

      sendStatusNotification(
        latestOrder,
        newStatus
      );
    }

    // ----------------------------------------------
    // REFRESH
    // ----------------------------------------------

    window.dispatchEvent(
      new Event("ordersUpdated")
    );

    setOrders(
      updatedAllOrders.filter(
        isOwnProviderOrder
      )
    );
  };

  // ==================================================
  // AFTER DELIVERY
  // ==================================================

  const handleDelivered = () => {
    setOrders(getProviderOrders());

    window.dispatchEvent(
      new Event("ordersUpdated")
    );
  };

  // ==================================================
  // STATUS CLASS
  // ==================================================

  const getStatusClass = (status) => {
    switch (normalizeStatus(status)) {
      case "Accepted":
        return "status-accepted";

      case "In Progress":
        return "status-progress";

      case "Completed":
        return "status-completed";

      case "Cancelled":
        return "status-cancelled";

      default:
        return "status-pending";
    }
  };

  // ==================================================
  // STATUS ICON
  // ==================================================

  const getStatusIcon = (status) => {
    switch (normalizeStatus(status)) {
      case "Accepted":
        return "🔵";

      case "In Progress":
        return "🟣";

      case "Completed":
        return "🟢";

      case "Cancelled":
        return "🔴";

      default:
        return "🟠";
    }
  };

  // ==================================================
  // STATISTICS
  // ==================================================

  const pendingOrders = orders.filter(
    (order) =>
      normalizeStatus(order.status) ===
      "Pending"
  ).length;

  const progressOrders = orders.filter(
    (order) =>
      normalizeStatus(order.status) ===
      "In Progress"
  ).length;

  const completedOrders = orders.filter(
    (order) =>
      normalizeStatus(order.status) ===
      "Completed"
  ).length;

  // ==================================================
  // REVIEWS
  // ==================================================

  const reviewedOrders = orders.filter(
    (order) => {
      const rating = Number(
        order.rating
      );

      return (
        order.reviewed === true &&
        Number.isFinite(rating) &&
        rating >= 1 &&
        rating <= 5
      );
    }
  );

  const averageRating =
    reviewedOrders.length > 0
      ? (
          reviewedOrders.reduce(
            (total, order) =>
              total +
              Number(order.rating),
            0
          ) /
          reviewedOrders.length
        ).toFixed(1)
      : "0.0";

  // ==================================================
  // PROVIDER ROLE CHECK
  // ==================================================

  if (providerRole !== "provider") {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="empty-orders">
            <div className="empty-icon">
              🔒
            </div>

            <h2>
              Provider Access Required
            </h2>

            <p>
              This dashboard is available
              only for provider accounts.
            </p>

            <Link
              to="/dashboard"
              className="order-now-btn"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* HEADER */}

        <div className="dashboard-header">
          <div>
            <span className="dashboard-label">
              KHADAMATX PROVIDER
            </span>

            <h1>
              Provider Dashboard 🛠️
            </h1>

            <p>
              Welcome{" "}
              <strong>
                {user?.name || "Provider"}
              </strong>
              . Manage your customer orders
              here.
            </p>
          </div>

          <div className="dashboard-header-actions">
            <Link
              to="/my-services"
              className="dashboard-btn"
            >
              My Services
            </Link>

            <Link
              to="/offer-service"
              className="dashboard-btn"
            >
              + Offer Service
            </Link>
          </div>
        </div>

        {/* STATISTICS */}

        <div className="dashboard-stats">

          <div className="stat-card">
            <span>📦</span>

            <div>
              <strong>
                {orders.length}
              </strong>

              <p>Total Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <span>🟠</span>

            <div>
              <strong>
                {pendingOrders}
              </strong>

              <p>Pending</p>
            </div>
          </div>

          <div className="stat-card">
            <span>🟣</span>

            <div>
              <strong>
                {progressOrders}
              </strong>

              <p>In Progress</p>
            </div>
          </div>

          <div className="stat-card">
            <span>🟢</span>

            <div>
              <strong>
                {completedOrders}
              </strong>

              <p>Completed</p>
            </div>
          </div>

          <div className="stat-card">
            <span>⭐</span>

            <div>
              <strong>
                {averageRating}
              </strong>

              <p>Average Rating</p>
            </div>
          </div>

        </div>

        {/* ORDERS */}

        <div className="orders-section">

          <div className="section-heading">
            <div>
              <span>
                INCOMING ORDERS
              </span>

              <h2>
                Customer Orders
              </h2>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="empty-orders">

              <div className="empty-icon">
                📦
              </div>

              <h3>
                No Orders Yet
              </h3>

              <p>
                New customer orders for your
                services will appear here.
              </p>

              <Link
                to="/my-services"
                className="order-now-btn"
              >
                View My Services
              </Link>

            </div>
          ) : (
            <div className="orders-list">

              {orders
                .slice()
                .sort(
                  (a, b) =>
                    new Date(
                      b.createdAt ||
                        b.date ||
                        0
                    ) -
                    new Date(
                      a.createdAt ||
                        a.date ||
                        0
                    )
                )
                .map((order) => {

                  const status =
                    normalizeStatus(
                      order.status
                    );

                  const rating = Math.max(
                    0,
                    Math.min(
                      5,
                      Number(
                        order.rating
                      ) || 0
                    )
                  );

                  return (
                    <div
                      className="order-card-dashboard"
                      key={order.id}
                    >

                      {/* ORDER TOP */}

                      <div className="order-card-top">

                        <div>
                          <span className="order-label">
                            SERVICE
                          </span>

                          <h3>
                            {order.service ||
                              order.serviceTitle ||
                              "Service"}
                          </h3>
                        </div>

                        <span
                          className={`order-status-badge ${getStatusClass(
                            status
                          )}`}
                        >
                          {getStatusIcon(
                            status
                          )}{" "}
                          {status}
                        </span>

                      </div>

                      {/* CUSTOMER */}

                      <div className="order-details">

                        <div>
                          <span>
                            Customer
                          </span>

                          <strong>
                            {order.customerName ||
                              order.customer ||
                              "—"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Email
                          </span>

                          <strong>
                            {order.customerEmail ||
                              "—"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Phone
                          </span>

                          <strong>
                            {order.phone ||
                              "—"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Price
                          </span>

                          <strong>
                            $
                            {Number(
                              order.price
                            ) || 0}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Provider
                          </span>

                          <strong>
                            {order.provider ||
                              "KhadamatX"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Date
                          </span>

                          <strong>
                            {order.date ||
                              order.createdAt ||
                              "—"}
                          </strong>
                        </div>

                      </div>

                      {/* PROJECT DETAILS */}

                      <div className="project-details">

                        <span>
                          PROJECT DETAILS
                        </span>

                        <p>
                          {order.details ||
                            "No project details provided."}
                        </p>

                      </div>

                      {/* DELIVERY */}

                      {order.delivered && (
                        <div className="provider-delivery-info">

                          <span>
                            PROJECT DELIVERED
                          </span>

                          <h4>
                            🎉 Delivery Sent
                          </h4>

                          {order.deliveryMessage && (
                            <p>
                              {
                                order.deliveryMessage
                              }
                            </p>
                          )}

                          {order.deliveryLink && (
                            <a
                              href={
                                order.deliveryLink
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="delivery-link"
                            >
                              🔗 Open Project
                            </a>
                          )}

                          {order.deliveryFileName && (
                            <div className="delivery-file">
                              📎{" "}
                              {
                                order.deliveryFileName
                              }
                            </div>
                          )}

                          <small>
                            Delivered:{" "}
                            {order.deliveredAt ||
                              "—"}
                          </small>

                        </div>
                      )}

                      {/* CUSTOMER REVIEW */}

                      {order.reviewed && (
                        <div className="provider-review">

                          <span>
                            CUSTOMER REVIEW
                          </span>

                          <div className="provider-rating">
                            {"★".repeat(
                              rating
                            )}

                            {"☆".repeat(
                              5 - rating
                            )}
                          </div>

                          <p>
                            {order.review ||
                              "No written review."}
                          </p>

                          <small>
                            Reviewed:{" "}
                            {order.reviewDate ||
                              order.reviewedAt ||
                              "—"}
                          </small>

                        </div>
                      )}

                      {/* ACTIONS */}

                      <div className="provider-order-actions">

                        {status === "Pending" && (
                          <>
                            <button
                              type="button"
                              className="provider-action-btn accept"
                              onClick={() =>
                                updateStatus(
                                  order.id,
                                  "Accepted"
                                )
                              }
                            >
                              ✓ Accept Order
                            </button>

                            <button
                              type="button"
                              className="provider-action-btn cancel"
                              onClick={() =>
                                updateStatus(
                                  order.id,
                                  "Cancelled"
                                )
                              }
                            >
                              ✕ Cancel
                            </button>
                          </>
                        )}

                        {status === "Accepted" && (
                          <button
                            type="button"
                            className="provider-action-btn progress"
                            onClick={() =>
                              updateStatus(
                                order.id,
                                "In Progress"
                              )
                            }
                          >
                            Start Work →
                          </button>
                        )}

                      </div>

                      {/* REJECTED PROJECT */}

                      {order.projectRejected &&
                        !order.delivered && (
                          <div className="cancelled-message">

                            ⚠️ Project Rejected

                            {order.rejectionReason && (
                              <p>
                                Reason:{" "}
                                {
                                  order.rejectionReason
                                }
                              </p>
                            )}

                          </div>
                        )}

                      {/* DELIVER PROJECT */}

                      {status === "In Progress" &&
                        !order.delivered && (
                          <DeliverProject
                            order={order}
                            onDelivered={
                              handleDelivered
                            }
                          />
                        )}

                      {/* WAITING FOR REVIEW */}

                      {order.delivered &&
                        order.projectStatus ===
                          "Waiting for Review" && (
                          <div className="completed-message">
                            ⏳ Waiting for
                            customer/admin review
                          </div>
                        )}

                      {/* APPROVED / COMPLETED */}

                      {status === "Completed" &&
                        order.projectStatus ===
                          "Approved" && (
                          <div className="completed-message">
                            ✓ Project Approved
                            <span>
                              {" "}
                              • Order Completed 🎉
                            </span>
                          </div>
                        )}

                      {/* CANCELLED */}

                      {status === "Cancelled" && (
                        <div className="cancelled-message">
                          ✕ Order Cancelled
                        </div>
                      )}

                    </div>
                  );
                })}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ProviderDashboard;