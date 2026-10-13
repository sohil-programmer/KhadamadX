
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  // ==================================================
  // SAFE STORAGE
  // ==================================================

  const readJSON = (key, fallback = null) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

  const normalize = (value) =>
    String(value ?? "").trim().toLowerCase();

  const [user, setUser] = useState(() =>
    readJSON("user", null)
  );

  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revisionOrderId, setRevisionOrderId] = useState(null);
  const [revisionText, setRevisionText] = useState("");
  const [submittingRevision, setSubmittingRevision] = useState(false);

  // ==================================================
  // PROJECT WEBSITE LINK
  // ==================================================

  const getProjectLink = (order) =>
    order?.websiteLink ||
    order?.projectLink ||
    order?.liveLink ||
    order?.liveWebsite ||
    order?.website ||
    order?.deliveryLink ||
    order?.projectUrl ||
    order?.websiteUrl ||
    "";

  const openProject = (order) => {
    const link = getProjectLink(order);

    if (!link) {
      alert("The project website link is not available.");
      return;
    }

    let url;

    try {
      url = new URL(
        /^https?:\/\//i.test(link)
          ? link
          : `https://${link}`
      );
    } catch {
      alert("The project link is invalid.");
      return;
    }

    if (!["http:", "https:"].includes(url.protocol)) {
      alert("This project link is not supported.");
      return;
    }

    window.open(url.href, "_blank", "noopener,noreferrer");
  };

  // ==================================================
  // PROJECT FILES
  // Uses the actual fields from DeliverProject.jsx
  // ==================================================

  const getProjectFiles = (order) => {
    if (!order) return [];

    const files = [];

    // Main file uploaded by DeliverProject.jsx
    if (order.deliveryFileData) {
      files.push({
        name: order.deliveryFileName || "Project File",
        data: order.deliveryFileData,
        type: order.deliveryFileType || "",
        size: Number(order.deliveryFileSize || 0),
      });
    }

    // Optional additional files saved by Admin
    const extras =
      order.projectFiles ||
      order.deliveryFiles ||
      order.deliveredFiles ||
      order.adminFiles ||
      order.projectAttachments ||
      order.attachments ||
      order.files ||
      [];

    const extraFiles = Array.isArray(extras)
      ? extras
      : extras && typeof extras === "object"
        ? [extras]
        : [];

    extraFiles.forEach((file) => {
      if (!file) return;

      const url =
        typeof file === "string"
          ? file
          : file.data ||
            file.fileData ||
            file.url ||
            file.fileUrl ||
            file.downloadUrl ||
            file.content ||
            "";

      // Do not show the delivery file twice
      if (
        url &&
        url === order.deliveryFileData
      ) {
        return;
      }

      files.push(
        typeof file === "string"
          ? {
              name: file.split("/").pop() || "Project File",
              data: file,
              type: "",
              size: 0,
            }
          : {
              ...file,
              name:
                file.name ||
                file.fileName ||
                file.title ||
                "Project File",
              data: url,
              type: file.type || file.fileType || "",
              size: Number(file.size || file.fileSize || 0),
            }
      );
    });

    return files;
  };

  // ==================================================
  // FILE VIEW / DOWNLOAD
  // ==================================================

  const getFileUrl = (file) =>
    file?.data ||
    file?.fileData ||
    file?.dataUrl ||
    file?.fileDataUrl ||
    file?.base64 ||
    file?.url ||
    file?.fileUrl ||
    file?.downloadUrl ||
    file?.content ||
    file?.src ||
    "";

  const viewFile = (file) => {
    const url = getFileUrl(file);

    if (!url) {
      alert("This file is not available.");
      return;
    }

    if (/^javascript:/i.test(url)) {
      alert("This file URL is not supported.");
      return;
    }

    if (
      /^https?:\/\//i.test(url) ||
      /^data:/i.test(url) ||
      /^blob:/i.test(url)
    ) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    alert(
      "The file URL is invalid. Please ask Admin to upload the file again."
    );
  };

  const downloadFile = (file) => {
    const url = getFileUrl(file);

    if (!url) {
      alert("This file is not available for download.");
      return;
    }

    if (
      !/^https?:\/\//i.test(url) &&
      !/^data:/i.test(url) &&
      !/^blob:/i.test(url)
    ) {
      alert("The file URL is invalid.");
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name || file.fileName || "project-file";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  // ==================================================
  // PROJECT STATUS
  // ==================================================

  const isProjectCompleted = (order) =>
    normalize(order?.status) === "completed" ||
    normalize(order?.projectStatus) === "approved" ||
    order?.projectApproved === true;

  const isRevisionRequested = (order) =>
    order?.revisionRequested === true ||
    normalize(order?.projectStatus) === "revision requested" ||
    normalize(order?.status) === "revision requested";

  // ==================================================
  // LOAD CUSTOMER ORDERS
  // ==================================================

  const loadOrders = useCallback(() => {
    const currentUser = readJSON("user", null);
    setUser(currentUser);

    if (!currentUser) {
      setAllOrders([]);
      setLoading(false);
      return;
    }

    const storedOrders = readJSON("orders", []);
    const orders = Array.isArray(storedOrders)
      ? [...storedOrders]
      : [];

    // Support the older single-order storage key
    const oldOrder = readJSON("order", null);

    if (
      oldOrder?.id &&
      !orders.some(
        (item) => String(item?.id) === String(oldOrder.id)
      )
    ) {
      orders.push(oldOrder);
    }

    const email = normalize(currentUser.email);
    const customerId = String(currentUser.id ?? "").trim();

    const customerOrders = orders.filter((order) => {
      if (!order || typeof order !== "object") return false;

      const orderEmail = normalize(
        order.customerEmail ||
        order.customer?.email ||
        ""
      );

      const orderCustomerId = String(
        order.customerId ||
        order.customer?.id ||
        ""
      ).trim();

      return (
        (email && orderEmail && email === orderEmail) ||
        (customerId &&
          orderCustomerId &&
          customerId === orderCustomerId)
      );
    });

    customerOrders.sort((a, b) => {
      const dateA = new Date(
        a.updatedAt || a.createdAt || a.date || 0
      ).getTime();

      const dateB = new Date(
        b.updatedAt || b.createdAt || b.date || 0
      ).getTime();

      return dateB - dateA;
    });

    setAllOrders(customerOrders);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();

    const handleStorage = (event) => {
      if (
        !event.key ||
        ["orders", "order", "user", "isLoggedIn"].includes(event.key)
      ) {
        loadOrders();
      }
    };

    window.addEventListener("ordersUpdated", loadOrders);
    window.addEventListener("authChange", loadOrders);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("ordersUpdated", loadOrders);
      window.removeEventListener("authChange", loadOrders);
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadOrders]);

  // ==================================================
  // STATISTICS
  // ==================================================

  const stats = useMemo(() => ({
    total: allOrders.length,

    pending: allOrders.filter(
      (o) => normalize(o.status) === "pending"
    ).length,

    inProgress: allOrders.filter(
      (o) => normalize(o.status) === "in progress"
    ).length,

    completed: allOrders.filter(
      (o) => normalize(o.status) === "completed"
    ).length,
  }), [allOrders]);

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  // ==================================================
  // REQUEST REVISION
  // ==================================================

  const submitRevision = (order) => {
    const message = revisionText.trim();

    if (!message) {
      alert("Please describe what needs to be changed.");
      return;
    }

    if (isRevisionRequested(order)) {
      alert("A revision request has already been submitted.");
      return;
    }

    setSubmittingRevision(true);

    try {
      const storedOrders = readJSON("orders", []);

      if (!Array.isArray(storedOrders)) {
        throw new Error("Orders storage is invalid.");
      }

      const index = storedOrders.findIndex(
        (item) => String(item?.id) === String(order.id)
      );

      if (index === -1) {
        throw new Error("Order not found.");
      }

      // Confirm this order belongs to the current customer
      const storedOrder = storedOrders[index];

      const customerEmail = normalize(user?.email);
      const orderEmail = normalize(
        storedOrder.customerEmail ||
        storedOrder.customer?.email ||
        ""
      );

      const customerId = String(user?.id ?? "").trim();
      const orderCustomerId = String(
        storedOrder.customerId ||
        storedOrder.customer?.id ||
        ""
      ).trim();

      const ownsOrder =
        (customerEmail && orderEmail && customerEmail === orderEmail) ||
        (customerId &&
          orderCustomerId &&
          customerId === orderCustomerId);

      if (!ownsOrder) {
        throw new Error("You cannot update this order.");
      }

      const now = new Date().toISOString();

      storedOrders[index] = {
        ...storedOrder,

        // Keep order status compatible with the existing
        // completed-order workflow. Track revision separately.
        revisionRequested: true,
        revisionRequest: message,
        revisionRequestedAt: now,
        projectStatus: "Revision Requested",
        updatedAt: now,
      };

      localStorage.setItem("orders", JSON.stringify(storedOrders));

      // Keep the legacy single-order key in sync if it matches.
      const oldOrder = readJSON("order", null);

      if (String(oldOrder?.id) === String(order.id)) {
        localStorage.setItem(
          "order",
          JSON.stringify(storedOrders[index])
        );
      }

      // Add an Admin-targeted notification.
      // AdminOrders/Admin notification UI must read this format.
      const savedNotifications = readJSON("notifications", []);
      const notifications = Array.isArray(savedNotifications)
        ? savedNotifications
        : [];

      notifications.unshift({
        id: `revision-${order.id}-${Date.now()}`,
        type: "revision",
        title: "Project Revision Requested",
        message: `${user?.name || "Customer"} requested a revision.`,
        description: message,
        orderId: order.id,
        customerId: user?.id || "",
        customerName: user?.name || "Customer",
        customerEmail: user?.email || "",
        serviceTitle:
          order.serviceTitle ||
          order.service ||
          order.category ||
          "Service",
        target: "admin",
        role: "admin",
        read: false,
        createdAt: now,
      });

      localStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
      );

      setRevisionOrderId(null);
      setRevisionText("");

      loadOrders();

      window.dispatchEvent(new Event("ordersUpdated"));
      window.dispatchEvent(new Event("notificationsUpdated"));

      alert("Your revision request has been saved.");
    } catch (error) {
      console.error("Revision request failed:", error);
      alert(error.message || "Failed to submit the revision request.");
    } finally {
      setSubmittingRevision(false);
    }
  };

  // ==================================================
  // LOGIN / LOADING
  // ==================================================

  if (!user) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-empty">
          <h2>Please Login</h2>
          <p>You need to login to view your dashboard.</p>
          <Link to="/login" className="dashboard-btn">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-empty">
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  // ==================================================
  // MAIN DASHBOARD
  // ==================================================

  return (
    <div className="dashboard-page">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <span className="dashboard-label">
            CUSTOMER DASHBOARD
          </span>

          <h1>Hello, {user.name || "Customer"} 👋</h1>

          <p>
            Manage your orders and download your completed projects.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      {/* STATISTICS */}
      <section className="dashboard-stats">
        <div className="dashboard-stat-card stat-total">
          <span>Total Orders</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="dashboard-stat-card stat-pending">
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </div>

        <div className="dashboard-stat-card stat-progress">
          <span>In Progress</span>
          <strong>{stats.inProgress}</strong>
        </div>

        <div className="dashboard-stat-card stat-completed">
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>
      </section>

      {/* ORDERS */}
      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <span className="dashboard-label">MY ORDERS</span>
            <h2>Your Orders</h2>
          </div>

          <Link to="/services" className="dashboard-btn">
            Find a Service
          </Link>
        </div>

        {allOrders.length === 0 ? (
          <div className="dashboard-empty">
            <h3>No orders yet</h3>
            <p>Your service orders will appear here.</p>

            <Link to="/services" className="dashboard-btn">
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {allOrders.map((order) => {
              const completed = isProjectCompleted(order);
              const revisionRequested = isRevisionRequested(order);
              const files = getProjectFiles(order);
              const projectLink = getProjectLink(order);

              const statusClass = normalize(order.status)
                .replace(/\s+/g, "-");

              return (
                <article
                  className={`customer-order-card order-status-${statusClass}`}
                  key={String(order.id)}
                >
                  {/* ORDER DETAILS */}
                  <div className="customer-order-main">
                    <div>
                      <span className="dashboard-label">
                        ORDER #{String(order.id).slice(-8)}
                      </span>

                      <h3>
                        {order.serviceTitle ||
                          order.service ||
                          order.category ||
                          "Service"}
                      </h3>

                      <p>
                        {order.details ||
                          "No additional project details."}
                      </p>
                    </div>

                    <strong className="customer-order-price">
                      ${order.price ?? 0}
                    </strong>
                  </div>

                  <div className="customer-order-meta">
                    <span>
                      Status: <strong>{order.status || "Pending"}</strong>
                    </span>

                    <span>
                      Date:{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : order.date || "-"}
                    </span>
                  </div>

                  {/* DELIVERY MESSAGE */}
                  {order.deliveryMessage && (
                    <div className="customer-project-box">
                      <div>
                        <span className="dashboard-label">DELIVERY MESSAGE</span>
                        <h4>Message from the provider</h4>
                        <p>{order.deliveryMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* PROJECT WEBSITE */}
                  {projectLink && (
                    <div className="customer-project-box">
                      <div>
                        <span className="dashboard-label">
                          PROJECT WEBSITE
                        </span>

                        <h4>Your project is ready 🎉</h4>

                        <p>
                          Open your completed website using the button.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="dashboard-btn"
                        onClick={() => openProject(order)}
                      >
                        View Website
                      </button>
                    </div>
                  )}

                  {/* PROJECT FILES */}
                  {files.length > 0 && (
                    <div className="customer-project-box">
                      <div>
                        <span className="dashboard-label">
                          PROJECT FILES
                        </span>

                        <h4>Delivered Files 📁</h4>

                        <p>
                          View or download files supplied with your project.
                        </p>
                      </div>

                      <div className="project-files-list">
                        {files.map((file, index) => {
                          const fileUrl = getFileUrl(file);
                          const fileName =
                            file.name ||
                            file.fileName ||
                            `Project File ${index + 1}`;

                          const fileType =
                            file.type ||
                            file.fileType ||
                            "Project file";

                          const size = Number(
                            file.size || file.fileSize || 0
                          );

                          const isImage =
                            String(fileType).startsWith("image/") ||
                            /\.(png|jpe?g|gif|webp|bmp)$/i.test(fileName);

                          return (
                            <div
                              className="customer-delivery-file"
                              key={`${fileName}-${index}`}
                            >
                              {isImage && fileUrl && (
                                <img
                                  className="customer-delivery-preview"
                                  src={fileUrl}
                                  alt={fileName}
                                />
                              )}

                              <div className="customer-delivery-file-info">
                                <strong>{fileName}</strong>

                                <small>
                                  {fileType}
                                  {size > 0
                                    ? ` · ${(size / 1024 / 1024).toFixed(2)} MB`
                                    : ""}
                                </small>
                              </div>

                              {fileUrl ? (
                                <div className="customer-delivery-file-actions">
                                  <button
                                    type="button"
                                    className="project-file-btn"
                                    onClick={() => viewFile(file)}
                                  >
                                    View
                                  </button>

                                  <button
                                    type="button"
                                    className="project-file-btn"
                                    onClick={() => downloadFile(file)}
                                  >
                                    Download
                                  </button>
                                </div>
                              ) : (
                                <small>
                                  File data is unavailable.
                                </small>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* COMPLETED BUT NO DELIVERABLES */}
                  {(completed || order.delivered === true) && !projectLink && files.length === 0 && (
                    <div className="customer-project-box project-waiting">
                      <div>
                        <span className="dashboard-label">
                          PROJECT COMPLETED
                        </span>

                        <h4>Project delivery details unavailable</h4>

                        <p>
                          No website link or downloadable files were found
                          for this order. Please contact Admin.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* WAITING FOR ADMIN REVIEW */}
                  {!completed && order.delivered === true && (
                    <div className="customer-project-box project-waiting">
                      <div>
                        <span className="dashboard-label">DELIVERY SUBMITTED</span>
                        <h4>Project submitted for review</h4>
                        <p>Your delivered files and links are shown above. Final approval is still pending.</p>
                      </div>
                    </div>
                  )}

                  {/* REVISION STATUS */}
                  {revisionRequested && (
                    <div className="customer-project-box project-revision">
                      <div>
                        <span className="dashboard-label">
                          REVISION REQUESTED
                        </span>

                        <h4>Waiting for Admin 🔄</h4>

                        <p>
                          Your revision request has been saved.
                        </p>

                        {order.revisionRequest && (
                          <p>
                            <strong>Your request:</strong>{" "}
                            {order.revisionRequest}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* REQUEST REVISION */}
                  {completed && !revisionRequested && (
                    <div className="customer-revision-area">
                      {revisionOrderId === String(order.id) ? (
                        <div className="revision-form">
                          <span className="dashboard-label">
                            REQUEST REVISION
                          </span>

                          <h4>What needs to be changed?</h4>

                          <textarea
                            rows={4}
                            maxLength={1000}
                            value={revisionText}
                            onChange={(event) =>
                              setRevisionText(event.target.value)
                            }
                            placeholder="Describe the changes you need..."
                          />

                          <div className="revision-actions">
                            <button
                              type="button"
                              className="dashboard-btn"
                              disabled={submittingRevision}
                              onClick={() => submitRevision(order)}
                            >
                              {submittingRevision
                                ? "Sending..."
                                : "Send Revision Request"}
                            </button>

                            <button
                              type="button"
                              className="revision-cancel-btn"
                              onClick={() => {
                                setRevisionOrderId(null);
                                setRevisionText("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="revision-request-btn"
                          onClick={() => {
                            setRevisionOrderId(String(order.id));
                            setRevisionText("");
                          }}
                        >
                          🔄 Request Revision
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;