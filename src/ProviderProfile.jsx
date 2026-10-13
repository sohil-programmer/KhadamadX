
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./ProviderProfile.css";

function ProviderProfile() {
  const { email } = useParams();

  const providerId = decodeURIComponent(email || "")
    .trim();

  const normalizedProviderId =
    providerId.toLowerCase();

  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);

  // ==========================================
  // DEFAULT KHADAMATX PROFILE
  // ==========================================

  const defaultProfile = {
    name: "KhadamatX",
    email: "khadamatx",
    bio:
      "Professional digital services provider helping clients with modern technology solutions.",
    location: "Afghanistan",
    skills: [
      "Web Development",
      "React.js",
      "Laravel",
      "Graphic Design",
      "Digital Marketing",
    ],
    image: "",
  };

  // ==========================================
  // DEFAULT KHADAMATX SERVICES
  // ==========================================

  const defaultServices = [
    {
      id: "web-development",
      title: "Web Development",
      category: "Web Development",
      price: 25,
      description:
        "Modern and responsive websites built with professional technologies.",
      provider: "KhadamatX",
      providerId: "khadamatx",
      providerEmail: "",
      icon: "💻",
      delivery: "3–7 Days",
      type: "default",
    },
    {
      id: "graphic-design",
      title: "Graphic Design",
      category: "Graphic Design",
      price: 15,
      description:
        "Professional logos, banners and social media designs.",
      provider: "KhadamatX",
      providerId: "khadamatx",
      providerEmail: "",
      icon: "🎨",
      delivery: "2–5 Days",
      type: "default",
    },
    {
      id: "mobile-app-development",
      title: "Mobile App Development",
      category: "Mobile App Development",
      price: 50,
      description:
        "Modern mobile applications with clean and user-friendly interfaces.",
      provider: "KhadamatX",
      providerId: "khadamatx",
      providerEmail: "",
      icon: "📱",
      delivery: "7–14 Days",
      type: "default",
    },
    {
      id: "digital-marketing",
      title: "Digital Marketing",
      category: "Digital Marketing",
      price: 20,
      description:
        "Digital marketing services to help businesses grow their online presence.",
      provider: "KhadamatX",
      providerId: "khadamatx",
      providerEmail: "",
      icon: "📈",
      delivery: "3–7 Days",
      type: "default",
    },
    {
      id: "video-editing",
      title: "Video Editing",
      category: "Video Editing",
      price: 20,
      description:
        "Professional video editing for YouTube, social media, business, and personal projects.",
      provider: "KhadamatX",
      providerId: "khadamatx",
      providerEmail: "",
      icon: "🎬",
      delivery: "2–5 Days",
      type: "default",
    },
    {
      id: "computer-services",
      title: "Computer Services",
      category: "Computer Services",
      price: 10,
      description:
        "Computer setup, software installation, troubleshooting, and technical support.",
      provider: "KhadamatX",
      providerId: "khadamatx",
      providerEmail: "",
      icon: "🖥️",
      delivery: "1–3 Days",
      type: "default",
    },
  ];

  // ==========================================
  // SAFE JSON PARSER
  // ==========================================

  const readArrayFromStorage = (key) => {
    try {
      const savedData = JSON.parse(
        localStorage.getItem(key) || "[]"
      );

      return Array.isArray(savedData)
        ? savedData
        : [];
    } catch (error) {
      console.error(
        `Unable to read ${key}:`,
        error
      );

      return [];
    }
  };

  // ==========================================
  // LOAD PROVIDER DATA
  // ==========================================

  const loadProvider = () => {
    const providerServices =
      readArrayFromStorage("providerServices");

    const allOrders =
      readArrayFromStorage("orders");

    const users =
      readArrayFromStorage("users");

    // ==========================================
    // DEFAULT KHADAMATX PROVIDER
    // ==========================================

    if (
      normalizedProviderId === "khadamatx"
    ) {
      setProfile(defaultProfile);
      setServices(defaultServices);
    } else {

      // ========================================
      // FIND PROVIDER ACCOUNT
      // ========================================

      let providerUser = users.find(
        (user) =>
          user &&
          String(user.email || "")
            .trim()
            .toLowerCase() ===
            normalizedProviderId &&
          String(user.role || "")
            .trim()
            .toLowerCase() === "provider"
      );

      // ========================================
      // FALLBACK TO CURRENT LOGGED-IN USER
      // ========================================

      if (!providerUser) {
        try {
          const savedUserData =
            localStorage.getItem("user");

          const savedUser = savedUserData
            ? JSON.parse(savedUserData)
            : null;

          if (
            savedUser &&
            String(savedUser.email || "")
              .trim()
              .toLowerCase() ===
              normalizedProviderId &&
            String(savedUser.role || "")
              .trim()
              .toLowerCase() === "provider"
          ) {
            providerUser = savedUser;
          }
        } catch (error) {
          console.error(
            "Unable to load current user:",
            error
          );
        }
      }

      // ========================================
      // PROVIDER PROFILE
      // ========================================

      if (providerUser) {
        const providerSkills =
          Array.isArray(providerUser.skills) &&
          providerUser.skills.length > 0
            ? providerUser.skills
            : [
                "Web Development",
                "Programming",
              ];

        setProfile({
          name:
            typeof providerUser.name === "string" &&
            providerUser.name.trim()
              ? providerUser.name.trim()
              : "Provider",

          email:
            typeof providerUser.email === "string"
              ? providerUser.email.trim()
              : providerId,

          bio:
            typeof providerUser.bio === "string" &&
            providerUser.bio.trim()
              ? providerUser.bio.trim()
              : "Professional service provider on KhadamatX.",

          location:
            typeof providerUser.location === "string" &&
            providerUser.location.trim()
              ? providerUser.location.trim()
              : "Afghanistan",

          skills: providerSkills,

          image:
            typeof providerUser.image === "string"
              ? providerUser.image
              : "",
        });
      } else {
        setProfile(null);
      }

      // ========================================
      // PROVIDER SERVICES
      // ========================================

      const providerServiceList =
        providerServices.filter((service) => {
          if (
            !service ||
            typeof service !== "object"
          ) {
            return false;
          }

          const status =
            String(service.status || "Active")
              .trim()
              .toLowerCase();

          if (status !== "active") {
            return false;
          }

          const serviceEmail =
            String(
              service.providerEmail ||
                service.email ||
                ""
            )
              .trim()
              .toLowerCase();

          const serviceProviderId =
            String(
              service.providerId || ""
            )
              .trim()
              .toLowerCase();

          const serviceProvider =
            String(
              service.provider || ""
            )
              .trim()
              .toLowerCase();

          return (
            serviceEmail ===
              normalizedProviderId ||
            serviceProviderId ===
              normalizedProviderId ||
            serviceProvider ===
              normalizedProviderId
          );
        });

      setServices(providerServiceList);
    }

    // ==========================================
    // PROVIDER ORDERS
    // ==========================================

    const providerOrders =
      allOrders.filter((order) => {
        if (
          !order ||
          typeof order !== "object"
        ) {
          return false;
        }

        const orderProviderEmail =
          String(
            order.providerEmail || ""
          )
            .trim()
            .toLowerCase();

        const orderProviderId =
          String(
            order.providerId || ""
          )
            .trim()
            .toLowerCase();

        const orderProvider =
          String(
            order.provider || ""
          )
            .trim()
            .toLowerCase();

        return (
          orderProviderEmail ===
            normalizedProviderId ||
          orderProviderId ===
            normalizedProviderId ||
          orderProvider ===
            normalizedProviderId
        );
      });

    setOrders(providerOrders);
  };

  // ==========================================
  // LOAD / REFRESH DATA
  // ==========================================

  useEffect(() => {
    loadProvider();

    window.addEventListener(
      "ordersUpdated",
      loadProvider
    );

    window.addEventListener(
      "storage",
      loadProvider
    );

    window.addEventListener(
      "profileUpdated",
      loadProvider
    );

    window.addEventListener(
      "servicesUpdated",
      loadProvider
    );

    return () => {
      window.removeEventListener(
        "ordersUpdated",
        loadProvider
      );

      window.removeEventListener(
        "storage",
        loadProvider
      );

      window.removeEventListener(
        "profileUpdated",
        loadProvider
      );

      window.removeEventListener(
        "servicesUpdated",
        loadProvider
      );
    };
  }, [providerId]);

  // ==========================================
  // REVIEWED ORDERS
  // ==========================================

  const reviewedOrders = orders.filter(
    (order) =>
      order &&
      order.reviewed === true &&
      Number(order.rating) >= 1 &&
      Number(order.rating) <= 5
  );

  // ==========================================
  // AVERAGE RATING
  // ==========================================

  const averageRating =
    reviewedOrders.length > 0
      ? (
          reviewedOrders.reduce(
            (total, order) =>
              total + Number(order.rating),
            0
          ) / reviewedOrders.length
        ).toFixed(1)
      : "0.0";

  // ==========================================
  // ROUNDED RATING
  // ==========================================

  const roundedRating = Math.min(
    5,
    Math.max(
      0,
      Math.round(Number(averageRating))
    )
  );

  // ==========================================
  // COMPLETED ORDERS
  // ==========================================

  const completedOrders =
    orders.filter(
      (order) =>
        String(order.status || "")
          .trim()
          .toLowerCase() === "completed"
    ).length;

  // ==========================================
  // CHECK CURRENT USER
  // ==========================================

  let currentUserEmail = "";

  try {
    const savedUserData =
      localStorage.getItem("user");

    const savedUser = savedUserData
      ? JSON.parse(savedUserData)
      : null;

    currentUserEmail =
      String(savedUser?.email || "")
        .trim()
        .toLowerCase();
  } catch {
    currentUserEmail = "";
  }

  const isOwnProfile =
    currentUserEmail !== "" &&
    currentUserEmail ===
      normalizedProviderId;

  // ==========================================
  // PROVIDER NOT FOUND
  // ==========================================

  if (!profile) {
    return (
      <div className="provider-profile-page">

        <div className="empty-provider">

          <h3>
            Provider Not Found
          </h3>

          <p>
            This provider profile could not
            be found.
          </p>

          <Link
            to="/services"
            className="service-view-btn"
          >
            Back to Services →
          </Link>

        </div>

      </div>
    );
  }

  // ==========================================
  // MAIN PROVIDER PROFILE
  // ==========================================

  return (
    <div className="provider-profile-page">

      {/* ======================================
          PROVIDER HERO
      ======================================= */}

      <section className="provider-profile-hero">

        {/* Avatar */}

        <div className="provider-avatar">

          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
            />
          ) : (
            profile.name
              .charAt(0)
              .toUpperCase()
          )}

        </div>

        {/* Provider Information */}

        <div className="provider-info">

          <span className="provider-label">
            VERIFIED SERVICE PROVIDER
          </span>

          <h1>
            {profile.name}
          </h1>

          {/* Edit Profile */}

          {isOwnProfile && (
            <Link
              to="/edit-profile"
              className="edit-profile-link"
            >
              ✏️ Edit Profile
            </Link>
          )}

          <p>
            {profile.bio}
          </p>

          <div className="provider-location">
            📍 {profile.location}
          </div>

          {/* Rating */}

          <div className="provider-rating-large">

            <span className="stars">

              {"★".repeat(
                roundedRating
              )}

              {"☆".repeat(
                5 - roundedRating
              )}

            </span>

            <strong>
              {averageRating}
            </strong>

            <span>
              ({reviewedOrders.length} reviews)
            </span>

          </div>

        </div>

      </section>

      {/* ======================================
          PROVIDER STATS
      ======================================= */}

      <section className="provider-stats">

        <div className="provider-stat-card">

          <span>
            Services
          </span>

          <strong>
            {services.length}
          </strong>

        </div>

        <div className="provider-stat-card">

          <span>
            Completed Orders
          </span>

          <strong>
            {completedOrders}
          </strong>

        </div>

        <div className="provider-stat-card">

          <span>
            Reviews
          </span>

          <strong>
            {reviewedOrders.length}
          </strong>

        </div>

        <div className="provider-stat-card">

          <span>
            Rating
          </span>

          <strong>
            ⭐ {averageRating}
          </strong>

        </div>

      </section>

      {/* ======================================
          SKILLS & EXPERTISE
      ======================================= */}

      <section className="provider-section">

        <div className="section-heading">

          <span>
            EXPERTISE
          </span>

          <h2>
            Skills & Expertise
          </h2>

        </div>

        <div className="provider-skills">

          {Array.isArray(profile.skills) &&
          profile.skills.length > 0 ? (
            profile.skills.map(
              (skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="skill-tag"
                >
                  {skill}
                </span>
              )
            )
          ) : (
            <span className="skill-tag">
              Professional Services
            </span>
          )}

        </div>

      </section>

      {/* ======================================
          PROVIDER SERVICES
      ======================================= */}

      <section className="provider-section">

        <div className="section-heading">

          <span>
            WHAT I OFFER
          </span>

          <h2>
            My Services
          </h2>

        </div>

        {services.length > 0 ? (

          <div className="provider-services-grid">

            {services.map(
              (service, index) => (

                <div
                  className="provider-service-card"
                  key={`${service.type || "service"}-${
                    service.id || index
                  }`}
                >

                  <div className="service-card-top">

                    <span>
                      {service.category ||
                        "Service"}
                    </span>

                    <strong>
                      {Number.isFinite(
                        Number(service.price)
                      )
                        ? `$${Number(service.price)}`
                        : "Price on Request"}
                    </strong>

                  </div>

                  <h3>
                    {service.title ||
                      "Professional Service"}
                  </h3>

                  <p>
                    {service.description ||
                      "Professional service provided by this KhadamatX provider."}
                  </p>

                  <Link
                    to={`/services/${encodeURIComponent(
                      String(service.id)
                    )}`}
                    state={{
                      service,
                    }}
                    className="service-view-btn"
                  >
                    View Service

                    <span>
                      →
                    </span>

                  </Link>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="empty-provider">

            <h3>
              No Services Yet
            </h3>

            <p>
              This provider has not published
              any services.
            </p>

          </div>

        )}

      </section>

      {/* ======================================
          CUSTOMER REVIEWS
      ======================================= */}

      <section className="provider-section">

        <div className="section-heading">

          <span>
            CLIENT FEEDBACK
          </span>

          <h2>
            Customer Reviews
          </h2>

        </div>

        {reviewedOrders.length > 0 ? (

          <div className="provider-reviews">

            {reviewedOrders.map(
              (order) => {

                const rating = Math.min(
                  5,
                  Math.max(
                    0,
                    Number(order.rating) || 0
                  )
                );

                return (
                  <div
                    className="provider-review-card"
                    key={order.id}
                  >

                    {/* Review Header */}

                    <div className="review-card-header">

                      {/* Customer */}

                      <div className="review-user">

                        <div className="review-avatar">

                          {(
                            order.customerName ||
                            order.customer ||
                            "C"
                          )
                            .charAt(0)
                            .toUpperCase()}

                        </div>

                        <div>

                          <strong>
                            {order.customerName ||
                              order.customer ||
                              "Customer"}
                          </strong>

                          <small>
                            {order.reviewDate ||
                              "Recently"}
                          </small>

                        </div>

                      </div>

                      {/* Rating */}

                      <div className="review-rating">

                        {"★".repeat(
                          rating
                        )}

                        {"☆".repeat(
                          5 - rating
                        )}

                      </div>

                    </div>

                    {/* Review Text */}

                    <p>
                      {order.review ||
                        "No written review."}
                    </p>

                  </div>
                );
              }
            )}

          </div>

        ) : (

          <div className="empty-provider">

            <h3>
              No Reviews Yet
            </h3>

            <p>
              Customer reviews will appear
              here after completed orders.
            </p>

          </div>

        )}

      </section>

    </div>
  );
}

export default ProviderProfile;
