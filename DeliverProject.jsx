import { useState } from "react";
import { createNotification } from "./notificationHelper";
import "./DeliverProject.css";

function DeliverProject({ order = null, onDelivered }) {
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState("");
  const [loading, setLoading] = useState(false);

  // ----------------------------------------
  // File Upload
  // ----------------------------------------
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setFileData("");
      return;
    }

    // Maximum 5MB
    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      alert("File size must be 5MB or less.");

      event.target.value = "";
      setFile(null);
      setFileData("");

      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();

    reader.onload = () => {
      setFileData(reader.result || "");
    };

    reader.onerror = () => {
      alert("Failed to read the selected file.");

      setFile(null);
      setFileData("");
    };

    reader.readAsDataURL(selectedFile);
  };

  // ----------------------------------------
  // Validate Project Link
  // ----------------------------------------
  const validateLink = (value) => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      return true;
    }

    try {
      const url = new URL(cleanValue);

      return (
        url.protocol === "http:" ||
        url.protocol === "https:"
      );
    } catch {
      return false;
    }
  };

  // ----------------------------------------
  // Deliver Project
  // ----------------------------------------
  const handleDeliver = () => {
    if (!order?.id) {
      alert("Order information is missing.");
      return;
    }

    const cleanMessage = message.trim();
    const cleanLink = link.trim();

    // Must have at least one delivery item
    if (
      !cleanMessage &&
      !cleanLink &&
      !fileData
    ) {
      alert(
        "Please add a delivery message, project link, or file."
      );

      return;
    }

    // Validate URL
    if (!validateLink(cleanLink)) {
      alert(
        "Please enter a valid HTTP or HTTPS project link."
      );

      return;
    }

    // Prevent duplicate submission
    if (
      order.projectStatus === "Waiting for Review" ||
      order.projectApproved === true
    ) {
      alert(
        "This project has already been submitted for review."
      );

      return;
    }

    setLoading(true);

    try {
      // ----------------------------------------
      // Read Orders Safely
      // ----------------------------------------
      let allOrders = [];

      try {
        const savedOrders =
          localStorage.getItem("orders");

        const parsedOrders = savedOrders
          ? JSON.parse(savedOrders)
          : [];

        allOrders = Array.isArray(parsedOrders)
          ? parsedOrders
          : [];
      } catch (error) {
        console.error(
          "Failed to read orders:",
          error
        );

        alert(
          "Orders data is corrupted. Please refresh the page."
        );

        setLoading(false);
        return;
      }

      // ----------------------------------------
      // Find Current Order
      // ----------------------------------------
      const orderIndex = allOrders.findIndex(
        (item) =>
          item &&
          String(item.id) === String(order.id)
      );

      if (orderIndex === -1) {
        alert("Order not found.");

        setLoading(false);
        return;
      }

      const existingOrder =
        allOrders[orderIndex];

      // ----------------------------------------
      // Prevent Duplicate Delivery From Storage
      // ----------------------------------------
      if (
        existingOrder.projectStatus ===
          "Waiting for Review" ||
        existingOrder.projectApproved === true
      ) {
        alert(
          "This project has already been submitted for review."
        );

        setLoading(false);
        return;
      }

      const now =
        new Date().toISOString();

      // ----------------------------------------
      // Updated Order
      // ----------------------------------------
      const deliveredOrder = {
        ...existingOrder,

        /*
         * IMPORTANT:
         * Provider delivery does NOT make
         * the order Completed.
         *
         * Admin must approve first.
         */
        status: "In Progress",

        delivered: true,

        // Delivery content
        deliveryMessage: cleanMessage,
        deliveryLink: cleanLink,

        deliveryFileName:
          file?.name || "",

        deliveryFileData:
          fileData || "",

        deliveryFileType:
          file?.type || "",

        deliveryFileSize:
          file?.size || 0,

        // Dates
        deliveredAt: now,
        updatedAt: now,

        // Admin review
        projectStatus:
          "Waiting for Review",

        projectApproved:
          false,

        projectRejected:
          false,

        rejectionReason:
          "",

        approvedAt:
          null,
      };

      // ----------------------------------------
      // Update Order
      // ----------------------------------------
      allOrders[orderIndex] =
        deliveredOrder;

      localStorage.setItem(
        "orders",
        JSON.stringify(allOrders)
      );

      // ----------------------------------------
      // Legacy Single Order
      // ----------------------------------------
      localStorage.setItem(
        "order",
        JSON.stringify(deliveredOrder)
      );

      // ----------------------------------------
      // Refresh Application
      // ----------------------------------------
      window.dispatchEvent(
        new Event("ordersUpdated")
      );

      // ----------------------------------------
      // Customer Notification
      // ----------------------------------------
      const customerEmail =
        String(
          deliveredOrder.customerEmail ||
            deliveredOrder.customer?.email ||
            ""
        )
          .trim()
          .toLowerCase();

      if (customerEmail) {
        createNotification({
          email: customerEmail,

          title:
            "Project Submitted for Review",

          message:
            "Your project has been delivered by the provider and is now waiting for admin review.",

          icon: "📦",

          type: "delivery",
        });
      }

      // ----------------------------------------
      // Success
      // ----------------------------------------
      alert(
        "Project delivered successfully.\n\nWaiting for admin review."
      );

      // Clear form
      setMessage("");
      setLink("");
      setFile(null);
      setFileData("");

      // Notify parent
      if (typeof onDelivered === "function") {
        onDelivered(deliveredOrder);
      }
    } catch (error) {
      console.error(
        "Delivery error:",
        error
      );

      alert(
        "Something went wrong while delivering the project."
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------
  // Safety UI
  // ----------------------------------------
  if (!order?.id) {
    return (
      <div className="deliver-project-card">
        <div className="delivery-review-notice">
          <span>⚠️</span>

          <div>
            <strong>
              Order Information Missing
            </strong>

            <p>
              The delivery form cannot be opened
              because the order information is
              unavailable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // Main UI
  // ----------------------------------------
  return (
    <div className="deliver-project-card">

      {/* Header */}
      <div className="deliver-project-header">

        <div>
          <span className="deliver-project-label">
            PROJECT DELIVERY
          </span>

          <h3>
            Deliver Completed Work
          </h3>

          <p>
            Submit the project for admin review.
            The order will only become completed
            after admin approval.
          </p>
        </div>

        <div className="deliver-project-icon">
          📦
        </div>

      </div>

      {/* Admin Review Notice */}
      <div className="delivery-review-notice">

        <span>🛡️</span>

        <div>
          <strong>
            Admin Review Required
          </strong>

          <p>
            After delivery, the project will be
            reviewed by the administrator before
            the order is marked as completed.
          </p>
        </div>

      </div>

      {/* Form */}
      <div className="deliver-form">

        {/* Message */}
        <div className="deliver-field">

          <label>
            Delivery Message
          </label>

          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="Write a short message about the completed work..."
            rows="5"
            maxLength={1000}
          />

          <small>
            {message.length}/1000
          </small>

        </div>

        {/* Link */}
        <div className="deliver-field">

          <label>
            Project Link
          </label>

          <input
            type="url"
            value={link}
            onChange={(e) =>
              setLink(e.target.value)
            }
            placeholder="https://example.com/project"
          />

          <small>
            Optional — GitHub, Google Drive,
            live website, etc.
          </small>

        </div>

        {/* File */}
        <div className="deliver-field">

          <label>
            Project File
          </label>

          <div className="file-upload-box">

            <input
              id={`delivery-file-${order.id}`}
              type="file"
              onChange={handleFileChange}
            />

            <label
              htmlFor={`delivery-file-${order.id}`}
              className="file-upload-label"
            >

              <span className="upload-icon">
                ⬆
              </span>

              <span>
                {file
                  ? file.name
                  : "Choose project file"}
              </span>

              <small>
                Maximum 5MB
              </small>

            </label>

          </div>

          {/* Selected File */}
          {file && (
            <div className="selected-file">

              <span>
                📎
              </span>

              <div>

                <strong>
                  {file.name}
                </strong>

                <small>
                  {(
                    file.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </small>

              </div>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setFileData("");
                }}
              >
                Remove
              </button>

            </div>
          )}

        </div>

        {/* Submit */}
        <button
          type="button"
          className="deliver-submit-btn"
          onClick={handleDeliver}
          disabled={loading}
        >

          {loading ? (
            <>
              <span className="delivery-spinner"></span>

              Submitting...
            </>
          ) : (
            <>
              🚀 Submit Project for Review
            </>
          )}

        </button>

      </div>

    </div>
  );
}

export default DeliverProject;