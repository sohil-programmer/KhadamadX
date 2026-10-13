
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminOrders.css";
import { createNotification } from "./notificationHelper";

const MAX_FILE_SIZE = 3 * 1024 * 1024;

function readJSON(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return fallback;
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminLink, setAdminLink] = useState("");
  const [adminFile, setAdminFile] = useState(null);
  const [adminFileData, setAdminFileData] = useState("");

  // Load orders
  const loadOrders = () => {
    const savedOrders = readJSON("orders", []);

    setOrders(
      Array.isArray(savedOrders)
        ? savedOrders.filter(
            (item) => item && typeof item === "object"
          )
        : []
    );
  };

  useEffect(() => {
    loadOrders();

    window.addEventListener("ordersUpdated", loadOrders);
    window.addEventListener("storage", loadOrders);

    return () => {
      window.removeEventListener("ordersUpdated", loadOrders);
      window.removeEventListener("storage", loadOrders);
    };
  }, []);

  const getOrder = (id) =>
    orders.find((item) => String(item.id) === String(id));

  const hasProject = (order) =>
    Boolean(
      String(order?.deliveryMessage || "").trim() ||
      String(order?.deliveryLink || "").trim() ||
      order?.deliveryFileData ||
      order?.deliveryFileName
    );

  const hasRevisionRequest = (order) =>
    order?.revisionRequested === true &&
    Boolean(String(order?.revisionRequest || "").trim());

  // Save orders
  const saveOrders = (updatedOrders) => {
    try {
      localStorage.setItem("orders", JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
      window.dispatchEvent(new Event("ordersUpdated"));
      return true;
    } catch (error) {
      console.error("Unable to save orders:", error);
      alert("Unable to save orders. Browser storage may be full.");
      return false;
    }
  };

  // Update legacy order
  const updateLegacyOrder = (order) => {
    if (!order) return;

    const legacy = readJSON("order", null);

    if (legacy && String(legacy.id) === String(order.id)) {
      localStorage.setItem("order", JSON.stringify(order));
    }
  };

  // Notifications
  const notifyUser = (
    email,
    title,
    message,
    icon = "🔔",
    type = "order"
  ) => {
    const normalized = normalizeEmail(email);
    if (!normalized) return;

    createNotification({
      email: normalized,
      title,
      message,
      icon,
      type,
    });
  };

  const notifyCustomer = (
    order,
    title,
    message,
    icon = "🔔",
    type = "order"
  ) => {
    notifyUser(
      order?.customerEmail || order?.customer?.email,
      title,
      message,
      icon,
      type
    );
  };

  const notifyProvider = (
    order,
    title,
    message,
    icon = "🔔"
  ) => {
    notifyUser(
      order?.providerEmail || order?.provider?.email,
      title,
      message,
      icon,
      "order"
    );
  };

  // Delete order
  const deleteOrder = (id) => {
    const order = getOrder(id);
    if (!order) return alert("Order not found.");

    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    const updated = orders.filter(
      (item) => String(item.id) !== String(id)
    );

    if (saveOrders(updated)) {
      const legacy = readJSON("order", null);

      if (legacy && String(legacy.id) === String(id)) {
        localStorage.removeItem("order");
      }

      if (String(editingProjectId) === String(id)) {
        cancelEditProject();
      }
    }
  };

  // Admin can cancel an order; approval flow controls completion
  const changeStatus = (id, newStatus) => {
    const order = getOrder(id);
    if (!order) return alert("Order not found.");

    if (newStatus === order.status) return;

    if (newStatus !== "Cancelled") {
      alert(
        newStatus === "Completed"
          ? "Use Approve & Deliver after reviewing the submitted project."
          : "The provider must manage this order status from Provider Dashboard."
      );
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    const now = new Date().toISOString();

    const updated = orders.map((item) =>
      String(item.id) === String(id)
        ? {
            ...item,
            status: "Cancelled",
            updatedAt: now,
          }
        : item
    );

    if (!saveOrders(updated)) return;

    const cancelled = updated.find(
      (item) => String(item.id) === String(id)
    );

    updateLegacyOrder(cancelled);

    notifyCustomer(
      cancelled,
      "Order Cancelled",
      "Your order has been cancelled by Admin.",
      "❌"
    );

    notifyProvider(
      cancelled,
      "Order Cancelled",
      "An order assigned to you has been cancelled by Admin.",
      "❌"
    );
  };

  // Edit project
  const startEditProject = (order) => {
    setEditingProjectId(order.id);
    setAdminMessage(order.deliveryMessage || "");
    setAdminLink(order.deliveryLink || "");
    setAdminFile(null);
    setAdminFileData(order.deliveryFileData || "");
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setAdminMessage("");
    setAdminLink("");
    setAdminFile(null);
    setAdminFileData("");
  };

  // Select project file
  const handleAdminFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_FILE_SIZE) {
      alert("Maximum file size is 3 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setAdminFile(selected);
      setAdminFileData(String(reader.result || ""));
    };

    reader.onerror = () => {
      alert("Unable to read this file.");
      setAdminFile(null);
      setAdminFileData("");
    };

    reader.readAsDataURL(selected);
  };

  // Save project details without approving
  const saveAdminProject = (id) => {
    const order = getOrder(id);
    if (!order) return alert("Order not found.");

    if (order.projectApproved === true) {
      return alert("This project has already been approved.");
    }

    const message = adminMessage.trim();
    const link = adminLink.trim();

    if (!message && !link && !adminFileData) {
      return alert("Add a message, project link, or file first.");
    }

    if (link) {
      try {
        const url = new URL(link);

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL");
        }
      } catch {
        return alert("Enter a valid HTTP or HTTPS project link.");
      }
    }

    const now = new Date().toISOString();

    const updated = orders.map((item) =>
      String(item.id) !== String(id)
        ? item
        : {
            ...item,
            deliveryMessage: message,
            deliveryLink: link,
            deliveryFileData: adminFileData || item.deliveryFileData || "",
            deliveryFileName: adminFile
              ? adminFile.name
              : item.deliveryFileName || "",
            deliveryFileType: adminFile
              ? adminFile.type
              : item.deliveryFileType || "",
            deliveryFileSize: adminFile
              ? adminFile.size
              : item.deliveryFileSize || 0,
            updatedAt: now,
          }
    );

    if (!saveOrders(updated)) return;

    const saved = updated.find(
      (item) => String(item.id) === String(id)
    );

    updateLegacyOrder(saved);

    notifyCustomer(
      saved,
      "Project Updated",
      "Admin has updated the project information.",
      "📁"
    );

    alert("Project information saved successfully.");
    cancelEditProject();
  };

  // Mark revision request as reviewed
  const markRevisionReviewed = (id) => {
    const order = getOrder(id);

    if (!order || !hasRevisionRequest(order)) {
      return alert("No revision request found.");
    }

    if (order.revisionReviewed) {
      return alert("This request has already been reviewed.");
    }

    const now = new Date().toISOString();

    const updated = orders.map((item) =>
      String(item.id) === String(id)
        ? {
            ...item,
            revisionReviewed: true,
            revisionReviewedAt: now,
            updatedAt: now,
          }
        : item
    );

    if (!saveOrders(updated)) return;

    const saved = updated.find(
      (item) => String(item.id) === String(id)
    );

    updateLegacyOrder(saved);

    notifyCustomer(
      saved,
      "Revision Request Reviewed",
      "Admin has reviewed your revision request.",
      "🔄"
    );
  };

  // Approve submitted project
  const approveProject = (id) => {
    const order = getOrder(id);
    if (!order) return alert("Order not found.");

    const submittedForReview =
      order.projectStatus === "Waiting for Review" &&
      (order.delivered === true || order.delivered === "true");

    if (!submittedForReview) {
      return alert(
        "The provider must submit the project before Admin can approve it."
      );
    }

    if (!hasProject(order)) {
      return alert("No project content is available to approve.");
    }

    if (
      !window.confirm(
        "Approve this project and mark the order as Completed?"
      )
    ) {
      return;
    }

    const now = new Date().toISOString();

    const updated = orders.map((item) =>
      String(item.id) !== String(id)
        ? item
        : {
            ...item,
            projectApproved: true,
            projectRejected: false,
            projectStatus: "Approved",
            delivered: true,
            status: "Completed",
            approvedAt: now,
            updatedAt: now,
            rejectionReason: "",
          }
    );

    if (!saveOrders(updated)) return;

    const approved = updated.find(
      (item) => String(item.id) === String(id)
    );

    updateLegacyOrder(approved);

    notifyCustomer(
      approved,
      "Project Approved 🎉",
      `Your ${approved.service || "project"} has been approved and completed.`,
      "🎉",
      "success"
    );

    notifyProvider(
      approved,
      "Project Approved",
      "Admin has approved your submitted project.",
      "🎉"
    );

    alert("Project approved and delivered successfully!");
  };

  // Reject project and return it for revision
  const rejectProject = (id) => {
    const order = getOrder(id);
    if (!order) return alert("Order not found.");

    const submittedForReview =
      order.projectStatus === "Waiting for Review" &&
      (order.delivered === true || order.delivered === "true");

    if (!submittedForReview) {
      return alert("This project is not waiting for Admin review.");
    }

    const answer = window.prompt(
      "Why does this project need revision?"
    );

    if (answer === null) return;

    const reason = answer.trim() || "Project needs revision.";

    if (
      !window.confirm(
        `Send this project back for revision?\n\n${reason}`
      )
    ) {
      return;
    }

    const now = new Date().toISOString();

    const updated = orders.map((item) =>
      String(item.id) !== String(id)
        ? item
        : {
            ...item,
            projectApproved: false,
            projectRejected: true,
            projectStatus: "Rejected",
            delivered: false,
            status: "In Progress",
            rejectionReason: reason,
            approvedAt: null,
            updatedAt: now,
          }
    );

    if (!saveOrders(updated)) return;

    const rejected = updated.find(
      (item) => String(item.id) === String(id)
    );

    updateLegacyOrder(rejected);

    notifyProvider(
      rejected,
      "Project Revision Required",
      `Your project needs changes. Reason: ${reason}`,
      "🔄"
    );

    notifyCustomer(
      rejected,
      "Project Needs Revision",
      `Your project needs changes. Reason: ${reason}`,
      "🔄"
    );

    alert("Project returned for revision.");
  };

  // View project details
  const viewProject = (order) => {
    if (!hasProject(order)) {
      return alert("No project content is available.");
    }

    alert(
      [
        "PROJECT DELIVERY",
        "",
        `Service: ${order.service || "Unknown"}`,
        `Provider: ${order.provider || "Unknown"}`,
        `Customer: ${order.customerName || order.customer || "Unknown"}`,
        "",
        order.deliveryMessage
          ? `Message:\n${order.deliveryMessage}`
          : "",
        order.deliveryLink
          ? `Project Link:\n${order.deliveryLink}`
          : "",
        order.deliveryFileName
          ? `File: ${order.deliveryFileName}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
  };

  // Download project file
  const downloadProject = (order) => {
    if (!order?.deliveryFileData) {
      return alert("No project file is available.");
    }

    const anchor = document.createElement("a");
    anchor.href = order.deliveryFileData;
    anchor.download =
      order.deliveryFileName || "KhadamatX-Project";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  // Open project link
  const openProjectLink = (order) => {
    if (!order?.deliveryLink) {
      return alert("No project link is available.");
    }

    try {
      const url = new URL(order.deliveryLink);

      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Invalid link");
      }

      window.open(url.href, "_blank", "noopener,noreferrer");
    } catch {
      alert("Invalid project link.");
    }
  };

  // Project status label
  const getProjectStatus = (order) => {
    if (
      order.projectApproved === true &&
      order.projectStatus === "Approved"
    ) {
      return (
        <span className="project-approved">
          ✅ Approved &amp; Delivered
        </span>
      );
    }

    if (order.projectStatus === "Rejected") {
      return (
        <span className="project-rejected">
          ❌ Revision Required
        </span>
      );
    }

    if (
      order.projectStatus === "Waiting for Review" &&
      (order.delivered === true || order.delivered === "true")
    ) {
      return (
        <span className="project-review">
          📁 Waiting for Admin Review
        </span>
      );
    }

    return (
      <span className="project-not-delivered">
        ⏳ Not Delivered
      </span>
    );
  };

  // Search and status filter
  const filteredOrders = orders.filter((order) => {
    const searchable = [
      order.service,
      order.customerName,
      order.customer,
      order.customerEmail,
      order.provider,
      order.providerEmail,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchable.includes(
      search.trim().toLowerCase()
    );

    const matchesStatus =
      statusFilter === "All" ||
      (order.status || "Pending") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-header">
        <div>
          <span className="admin-label">KHADAMATX ADMIN</span>
          <h1>Orders Management</h1>
          <p>
            Manage orders, review deliveries, and customer revision requests.
          </p>
        </div>

        <Link to="/admin" className="back-admin-btn">
          ← Admin Dashboard
        </Link>
      </div>

      <div className="orders-toolbar">
        <input
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <span>{filteredOrders.length} Orders</span>
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Service</th>
              <th>Customer</th>
              <th>Provider</th>
              <th>Price</th>
              <th>Status</th>
              <th>Project / Revision</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => {
                const status = order.status || "Pending";

                const canReview =
                  order.projectStatus === "Waiting for Review" &&
                  (order.delivered === true ||
                    order.delivered === "true") &&
                  order.projectApproved !== true;

                return (
                  <tr key={order.id || index}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>
                        {order.service || "Unknown Service"}
                      </strong>
                    </td>

                    <td>
                      <div className="customer-info">
                        <strong>
                          {order.customerName ||
                            order.customer ||
                            "Unknown"}
                        </strong>
                        <small>
                          {order.customerEmail || "No email"}
                        </small>
                      </div>
                    </td>

                    <td>{order.provider || "Unknown"}</td>

                    <td>${Number(order.price) || 0}</td>

                    {/* Status and completion check */}
                    <td>
                      <div className="admin-order-status">
                        <select
                          className={`status ${
                            status === "Completed"
                              ? "completed"
                              : status === "Pending"
                              ? "pending"
                              : status === "Accepted"
                              ? "accepted"
                              : status === "In Progress"
                              ? "progress"
                              : status === "Cancelled"
                              ? "cancelled"
                              : ""
                          }`}
                          value={status}
                          onChange={(event) =>
                            changeStatus(
                              order.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="In Progress">
                            In Progress
                          </option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        {order.projectApproved === true &&
                          order.projectStatus === "Approved" &&
                          status === "Completed" && (
                            <span
                              className="order-completed-check"
                              title="Project approved and delivered"
                              aria-label="Project approved and delivered"
                            >
                              ✓
                            </span>
                          )}
                      </div>
                    </td>

                    <td>
                      <div className="project-actions">
                        {getProjectStatus(order)}

                        {hasRevisionRequest(order) && (
                          <div className="admin-revision-request">
                            <h4>🔄 Customer Revision Request</h4>
                            <p>{order.revisionRequest}</p>

                            <small>
                              Requested:{" "}
                              {order.revisionRequestedAt
                                ? new Date(
                                    order.revisionRequestedAt
                                  ).toLocaleString()
                                : "Date unavailable"}
                            </small>

                            {order.revisionReviewed ? (
                              <span className="revision-reviewed">
                                ✅ Reviewed
                                {order.revisionReviewedAt &&
                                  ` — ${new Date(
                                    order.revisionReviewedAt
                                  ).toLocaleString()}`}
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="review-revision-btn"
                                onClick={() =>
                                  markRevisionReviewed(order.id)
                                }
                              >
                                Mark as Reviewed
                              </button>
                            )}
                          </div>
                        )}

                        {hasProject(order) && (
                          <button
                            type="button"
                            className="view-project-btn"
                            onClick={() => viewProject(order)}
                          >
                            👁 View Project
                          </button>
                        )}

                        {order.deliveryFileData && (
                          <button
                            type="button"
                            className="download-project-btn"
                            onClick={() => downloadProject(order)}
                          >
                            📥 Download
                          </button>
                        )}

                        {order.deliveryLink && (
                          <button
                            type="button"
                            className="open-project-btn"
                            onClick={() => openProjectLink(order)}
                          >
                            🔗 Open Link
                          </button>
                        )}

                        {order.projectStatus !== "Approved" && (
                          <button
                            type="button"
                            className="edit-project-btn"
                            onClick={() => startEditProject(order)}
                          >
                            ✏️ Edit / Upload
                          </button>
                        )}

                        {String(editingProjectId) ===
                          String(order.id) && (
                          <div className="admin-project-box">
                            <h4>📁 Project Management</h4>

                            <div className="admin-project-field">
                              <label>Project Message</label>
                              <textarea
                                value={adminMessage}
                                onChange={(event) =>
                                  setAdminMessage(event.target.value)
                                }
                                placeholder="Project message..."
                              />
                            </div>

                            <div className="admin-project-field">
                              <label>Project Link</label>
                              <input
                                type="url"
                                value={adminLink}
                                onChange={(event) =>
                                  setAdminLink(event.target.value)
                                }
                                placeholder="https://example.com/project"
                              />
                            </div>

                            <div className="admin-project-field">
                              <label>
                                Upload / Replace Project File (Max 3MB)
                              </label>
                              <input
                                type="file"
                                onChange={handleAdminFileChange}
                              />

                              {adminFile && (
                                <p>New file: {adminFile.name}</p>
                              )}

                              {!adminFile &&
                                order.deliveryFileName && (
                                  <p>
                                    Current file: {order.deliveryFileName}
                                  </p>
                                )}
                            </div>

                            <button
                              type="button"
                              className="save-project-btn"
                              onClick={() =>
                                saveAdminProject(order.id)
                              }
                            >
                              💾 Save Project
                            </button>

                            <button
                              type="button"
                              className="cancel-project-btn"
                              onClick={cancelEditProject}
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {canReview && (
                          <>
                            <button
                              type="button"
                              className="approve-project-btn"
                              onClick={() =>
                                approveProject(order.id)
                              }
                            >
                              ✅ Approve &amp; Deliver
                            </button>

                            <button
                              type="button"
                              className="reject-project-btn"
                              onClick={() =>
                                rejectProject(order.id)
                              }
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                    <td>
                      {order.date
                        ? new Date(
                            order.date
                          ).toLocaleDateString()
                        : order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="delete-order-btn"
                        onClick={() => deleteOrder(order.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="no-orders">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrders;