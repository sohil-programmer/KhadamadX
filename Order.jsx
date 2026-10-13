import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { createNotification } from "./notificationHelper";

function Order() {
  const { service: serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  // ==================================================
  // SAFE JSON READER
  // ==================================================

  const readJSON = (key, fallback = null) => {
    try {
      const savedData = localStorage.getItem(key);

      if (!savedData) {
        return fallback;
      }

      const parsedData = JSON.parse(savedData);

      return parsedData ?? fallback;
    } catch (error) {
      console.error(`Invalid ${key} data:`, error);
      return fallback;
    }
  };

  // ==================================================
  // HELPERS
  // ==================================================

  const normalizeEmail = (email) =>
    String(email || "")
      .trim()
      .toLowerCase();

  const normalizeText = (value) =>
    String(value || "").trim();

  // ==================================================
  // DEFAULT KHADAMATX SERVICES
  // ==================================================
  //
  // These are platform services.
  //
  // They do NOT belong to a specific provider yet.
  // Therefore providerId/providerEmail remain empty.
  //
  // A future provider-assignment system can assign
  // these orders to a real provider.
  // ==================================================

  const defaultServices = [
    {
      id: "web-development",
      title: "Web Development",
      category: "Web Development",
      description:
        "Professional and responsive websites for businesses, portfolios, and online services.",
      price: 25,
      provider: "KhadamatX",
      providerId: "",
      providerEmail: "",
    },

    {
      id: "graphic-design",
      title: "Graphic Design",
      category: "Graphic Design",
      description:
        "Creative logos, social media designs, banners, and professional graphics.",
      price: 15,
      provider: "KhadamatX",
      providerId: "",
      providerEmail: "",
    },

    {
      id: "mobile-app-development",
      title: "Mobile App Development",
      category: "Mobile App Development",
      description:
        "Modern mobile applications designed for Android and iOS platforms.",
      price: 50,
      provider: "KhadamatX",
      providerId: "",
      providerEmail: "",
    },

    {
      id: "digital-marketing",
      title: "Digital Marketing",
      category: "Digital Marketing",
      description:
        "Digital marketing services to help businesses grow their online presence.",
      price: 20,
      provider: "KhadamatX",
      providerId: "",
      providerEmail: "",
    },

    {
      id: "video-editing",
      title: "Video Editing",
      category: "Video Editing",
      description:
        "Professional video editing for YouTube, social media, business, and personal projects.",
      price: 20,
      provider: "KhadamatX",
      providerId: "",
      providerEmail: "",
    },

    {
      id: "computer-services",
      title: "Computer Services",
      category: "Computer Services",
      description:
        "Computer setup, software installation, troubleshooting, and technical support.",
      price: 10,
      provider: "KhadamatX",
      providerId: "",
      providerEmail: "",
    },
  ];

  // ==================================================
  // PROVIDER SERVICES
  // ==================================================

  const providerServices = (() => {
    const services = readJSON(
      "providerServices",
      []
    );

    if (!Array.isArray(services)) {
      return [];
    }

    return services.filter(
      (service) =>
        service &&
        typeof service === "object" &&
        !Array.isArray(service)
    );
  })();

  // ==================================================
  // SERVICE FROM ROUTER STATE
  // ==================================================

  const stateService =
    location.state?.service &&
    typeof location.state.service === "object"
      ? location.state.service
      : null;

  // ==================================================
  // FIND PROVIDER SERVICE
  // ==================================================

  const providerService =
    providerServices.find((service) => {
      const serviceStatus = String(
        service.status || "Active"
      )
        .trim()
        .toLowerCase();

      return (
        String(service.id) ===
          String(serviceId) &&
        serviceStatus === "active"
      );
    }) || null;

  // ==================================================
  // FIND DEFAULT SERVICE
  // ==================================================

  const defaultService =
    defaultServices.find(
      (service) =>
        String(service.id) ===
        String(serviceId)
    ) || null;

  // ==================================================
  // SELECT SERVICE
  // ==================================================

  const selectedService =
    stateService ||
    providerService ||
    defaultService;

  // ==================================================
  // SERVICE NOT FOUND
  // ==================================================

  if (!selectedService) {
    return (
      <div className="service-details-page">
        <div className="service-details-container">

          <Link
            to="/services"
            className="back-link"
          >
            ← Back to Services
          </Link>

          <div className="empty-orders">

            <div className="empty-icon">
              ❌
            </div>

            <h2>
              Service Not Found
            </h2>

            <p>
              The service you are trying to
              order does not exist or is no
              longer available.
            </p>

            <Link
              to="/services"
              className="order-now-btn"
            >
              Browse Services
            </Link>

          </div>

        </div>
      </div>
    );
  }

  // ==================================================
  // HANDLE ORDER
  // ==================================================

  const handleOrder = (e) => {
    e.preventDefault();

    // ----------------------------------------------
    // PREVENT DUPLICATE SUBMISSION
    // ----------------------------------------------

    if (loading) {
      return;
    }

    // ----------------------------------------------
    // LOGIN CHECK
    // ----------------------------------------------

    const isLoggedIn =
      localStorage.getItem(
        "isLoggedIn"
      ) === "true";

    const savedUser =
      localStorage.getItem("user");

    if (!savedUser || !isLoggedIn) {
      alert(
        "Please login first ❌"
      );

      navigate("/login", {
        state: {
          from:
            location.pathname +
            location.search,
        },
      });

      return;
    }

    // ----------------------------------------------
    // PARSE USER
    // ----------------------------------------------

    let user = null;

    try {
      const parsedUser =
        JSON.parse(savedUser);

      if (
        parsedUser &&
        typeof parsedUser ===
          "object" &&
        !Array.isArray(parsedUser)
      ) {
        user = parsedUser;
      }
    } catch (error) {
      console.error(
        "Invalid user data:",
        error
      );
    }

    // ----------------------------------------------
    // INVALID USER
    // ----------------------------------------------

    if (!user) {
      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "isLoggedIn"
      );

      alert(
        "Your session is invalid. Please login again."
      );

      navigate("/login");

      return;
    }

    // ----------------------------------------------
    // CUSTOMER ROLE
    // ----------------------------------------------

    const userRole = String(
      user.role || "customer"
    )
      .trim()
      .toLowerCase();

    if (userRole !== "customer") {
      alert(
        "Only customers can place orders ❌"
      );

      if (
        userRole === "provider"
      ) {
        navigate(
          "/provider-dashboard"
        );
      } else if (
        userRole === "admin"
      ) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

      return;
    }

    // ----------------------------------------------
    // CUSTOMER EMAIL
    // ----------------------------------------------

    const customerEmail =
      normalizeEmail(user.email);

    if (!customerEmail) {
      alert(
        "Your account information is incomplete. Please login again."
      );

      navigate("/login");

      return;
    }

    // ----------------------------------------------
    // CUSTOMER ID
    // ----------------------------------------------

    const customerId =
      normalizeText(
        user.id ||
          customerEmail
      );

    // ----------------------------------------------
    // PHONE
    // ----------------------------------------------

    const cleanPhone =
      phone.trim();

    if (!cleanPhone) {
      alert(
        "Please enter your phone number."
      );

      return;
    }

    if (
      cleanPhone.length < 7
    ) {
      alert(
        "Please enter a valid phone number."
      );

      return;
    }

    // ----------------------------------------------
    // PROJECT DETAILS
    // ----------------------------------------------

    const cleanDetails =
      details.trim();

    if (!cleanDetails) {
      alert(
        "Please describe your project."
      );

      return;
    }

    if (
      cleanDetails.length < 10
    ) {
      alert(
        "Please provide more details about your project."
      );

      return;
    }

    // ----------------------------------------------
    // START LOADING
    // ----------------------------------------------

    setLoading(true);

    try {
      // ============================================
      // ORDER ID + DATE
      // ============================================

      const orderId =
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      const now =
        new Date().toISOString();

      // ============================================
      // PROVIDER INFORMATION
      // ============================================

      const providerName =
        normalizeText(
          selectedService.provider ||
            "KhadamatX"
        );

      const providerId =
        normalizeText(
          selectedService.providerId
        );

      const providerEmail =
        normalizeEmail(
          selectedService.providerEmail ||
            selectedService.email
        );

      // ============================================
      // SERVICE INFORMATION
      // ============================================

      const serviceIdValue =
        normalizeText(
          selectedService.id ||
            serviceId
        );

      const serviceTitle =
        normalizeText(
          selectedService.title ||
            selectedService.name ||
            "Service"
        );

      const category =
        normalizeText(
          selectedService.category
        );

      const price =
        Number(
          selectedService.price
        ) || 0;

      // ============================================
      // CREATE ORDER
      // ============================================

      const newOrder = {
        // ------------------------------------------
        // ORDER
        // ------------------------------------------

        id: orderId,

        serviceId:
          serviceIdValue,

        service:
          serviceTitle,

        serviceTitle:
          serviceTitle,

        category:
          category,

        price:
          price,

        // ------------------------------------------
        // PROVIDER
        // ------------------------------------------

        provider:
          providerName,

        providerName:
          providerName,

        providerId:
          providerId,

        providerEmail:
          providerEmail,

        // ------------------------------------------
        // CUSTOMER
        // ------------------------------------------

        customer:
          normalizeText(user.name),

        customerName:
          normalizeText(user.name),

        customerId:
          customerId,

        customerEmail:
          customerEmail,

        // Legacy compatibility
        email:
          customerEmail,

        // ------------------------------------------
        // CONTACT
        // ------------------------------------------

        phone:
          cleanPhone,

        // ------------------------------------------
        // PROJECT
        // ------------------------------------------

        details:
          cleanDetails,

        // ------------------------------------------
        // STATUS
        // ------------------------------------------

        status:
          "Pending",

        // ------------------------------------------
        // DATES
        // ------------------------------------------

        date:
          now,

        createdAt:
          now,

        updatedAt:
          now,

        // ------------------------------------------
        // DELIVERY
        // ------------------------------------------

        delivered:
          false,

        deliveryMessage:
          "",

        deliveryLink:
          "",

        deliveryFileName:
          "",

        deliveryFileData:
          "",

        deliveryFileType:
          "",

        deliveryFileSize:
          0,

        deliveredAt:
          null,

        // ------------------------------------------
        // PROJECT REVIEW
        // ------------------------------------------

        projectStatus:
          "Not Delivered",

        projectApproved:
          false,

        projectRejected:
          false,

        rejectionReason:
          "",

        approvedAt:
          null,

        // ------------------------------------------
        // CUSTOMER REVIEW
        // ------------------------------------------

        reviewed:
          false,

        rating:
          0,

        review:
          "",

        reviewDate:
          null,

        reviewedAt:
          null,
      };

      // ============================================
      // EXISTING ORDERS
      // ============================================

      let existingOrders =
        readJSON(
          "orders",
          []
        );

      if (
        !Array.isArray(
          existingOrders
        )
      ) {
        existingOrders = [];
      }

      existingOrders =
        existingOrders.filter(
          (order) =>
            order &&
            typeof order ===
              "object" &&
            !Array.isArray(order)
        );

      // ============================================
      // DUPLICATE PROTECTION
      // ============================================

      const duplicateOrder =
        existingOrders.some(
          (order) =>
            normalizeEmail(
              order.customerEmail
            ) === customerEmail &&
            String(
              order.serviceId || ""
            ) === serviceIdValue &&
            ["Pending", "Accepted", "In Progress"]
              .includes(
                normalizeText(
                  order.status
                )
              )
        );

      if (duplicateOrder) {
        alert(
          "You already have an active order for this service."
        );

        setLoading(false);

        return;
      }

      // ============================================
      // ADD ORDER
      // ============================================

      existingOrders.push(
        newOrder
      );

      // ============================================
      // SAVE ORDERS
      // ============================================

      localStorage.setItem(
        "orders",
        JSON.stringify(
          existingOrders
        )
      );

      // ============================================
      // SAVE LATEST ORDER
      // ============================================

      localStorage.setItem(
        "order",
        JSON.stringify(
          newOrder
        )
      );

      // ============================================
      // REFRESH DASHBOARDS
      // ============================================

      window.dispatchEvent(
        new Event(
          "ordersUpdated"
        )
      );

      // ============================================
      // PROVIDER NOTIFICATION
      // ============================================
      //
      // Only send notification if a real provider
      // is assigned.
      //
      // Platform/default orders have no provider
      // yet, so no fake provider notification.
      // ============================================

      if (
        providerEmail
      ) {
        createNotification({
          email:
            providerEmail,

          title:
            "New Order Received 🛒",

          message:
            `${user.name || "A customer"} placed a new order for ${newOrder.service}.`,

          icon:
            "🛒",

          type:
            "order",
        });
      }

      // ============================================
      // SUCCESS
      // ============================================

      alert(
        "Order placed successfully! ✅"
      );

      // ============================================
      // CUSTOMER DASHBOARD
      // ============================================

      navigate(
        "/dashboard"
      );

    } catch (error) {
      console.error(
        "Order Error:",
        error
      );

      alert(
        "Something went wrong while placing your order."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="service-details-page">

      <div className="service-details-container">

        {/* BACK */}

        <Link
          to="/services"
          className="back-link"
        >
          ← Back to Services
        </Link>

        {/* HEADER */}

        <div className="service-details-header">

          <div className="details-icon">
            🛠️
          </div>

          <div>

            <span className="details-label">
              PLACE YOUR ORDER
            </span>

            <h1>
              {selectedService.title}
            </h1>

            <p>
              {selectedService.description}
            </p>

          </div>

        </div>

        {/* MAIN GRID */}

        <div className="service-details-grid">

          {/* ORDER FORM */}

          <div className="service-about">

            <span className="details-label">
              ORDER DETAILS
            </span>

            <h2>
              Tell us about your project
            </h2>

            <form
              onSubmit={
                handleOrder
              }
            >

              {/* PHONE */}

              <div className="form-group">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  required
                />

              </div>

              {/* PROJECT DETAILS */}

              <div className="form-group">

                <label>
                  Project Details
                </label>

                <textarea
                  value={details}
                  onChange={(e) =>
                    setDetails(
                      e.target.value
                    )
                  }
                  placeholder="Describe what you need..."
                  rows="6"
                  minLength={10}
                  required
                />

              </div>

              {/* CONFIRM */}

              <button
                type="submit"
                className="order-now-btn"
                disabled={loading}
              >
                {loading
                  ? "Placing Order..."
                  : "Confirm Order →"}
              </button>

            </form>

          </div>

          {/* ORDER SUMMARY */}

          <div className="order-card">

            <span>
              SERVICE
            </span>

            <h2>
              {selectedService.title}
            </h2>

            {/* PROVIDER */}

            <p>
              Provider:{" "}

              <strong>
                {selectedService.provider ||
                  "KhadamatX"}
              </strong>
            </p>

            {/* PRICE */}

            <div
              style={{
                marginTop:
                  "20px",
              }}
            >

              <span>
                STARTING PRICE
              </span>

              <h2>
                $
                {Number(
                  selectedService.price
                ) || 0}
                +
              </h2>

            </div>

            {/* CATEGORY */}

            <div
              style={{
                marginTop:
                  "20px",
              }}
            >

              <span>
                CATEGORY
              </span>

              <p>
                {selectedService.category ||
                  "Professional Service"}
              </p>

            </div>

            {/* INITIAL STATUS */}

            <div
              style={{
                marginTop:
                  "20px",
              }}
            >

              <span>
                ORDER STATUS
              </span>

              <p>
                <strong>
                  Pending
                </strong>
              </p>

            </div>

            {/* DELIVERY FLOW */}

            <div
              style={{
                marginTop:
                  "20px",

                paddingTop:
                  "20px",

                borderTop:
                  "1px solid #333",
              }}
            >

              <span>
                PROJECT DELIVERY
              </span>

              <p
                style={{
                  color:
                    "#999",

                  fontSize:
                    "13px",

                  lineHeight:
                    "1.6",
                }}
              >
                After the provider finishes
                your project, the completed
                files or project link will
                appear in your dashboard.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Order;