import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";

function MyServices() {
  const navigate = useNavigate();

  // --------------------------------
  // Read current user safely
  // --------------------------------
  const readUser = () => {
    try {
      const savedUser =
        localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      const parsedUser =
        JSON.parse(savedUser);

      if (
        !parsedUser ||
        typeof parsedUser !== "object"
      ) {
        return null;
      }

      return parsedUser;
    } catch (error) {
      console.error(
        "Failed to read user:",
        error
      );

      return null;
    }
  };

  // --------------------------------
  // Read services safely
  // --------------------------------
  const readServices = () => {
    try {
      const savedServices =
        localStorage.getItem(
          "providerServices"
        );

      if (!savedServices) {
        return [];
      }

      const parsedServices =
        JSON.parse(savedServices);

      return Array.isArray(parsedServices)
        ? parsedServices
        : [];
    } catch (error) {
      console.error(
        "Failed to read provider services:",
        error
      );

      return [];
    }
  };

  const [user, setUser] = useState(
    readUser
  );

  const [allServices, setAllServices] =
    useState(readServices);

  // --------------------------------
  // Load / refresh services
  // --------------------------------
  const loadServices = useCallback(() => {
    setAllServices(readServices());
    setUser(readUser());
  }, []);

  // --------------------------------
  // Listen for service/profile changes
  // --------------------------------
  useEffect(() => {
    window.addEventListener(
      "servicesUpdated",
      loadServices
    );

    window.addEventListener(
      "profileUpdated",
      loadServices
    );

    window.addEventListener(
      "storage",
      loadServices
    );

    return () => {
      window.removeEventListener(
        "servicesUpdated",
        loadServices
      );

      window.removeEventListener(
        "profileUpdated",
        loadServices
      );

      window.removeEventListener(
        "storage",
        loadServices
      );
    };
  }, [loadServices]);

  // --------------------------------
  // Check provider
  // --------------------------------
  const userRole = String(
    user?.role || ""
  )
    .trim()
    .toLowerCase();

  const isProvider =
    userRole === "provider";

  // --------------------------------
  // Normalize provider email
  // --------------------------------
  const providerEmail = String(
    user?.email || ""
  )
    .trim()
    .toLowerCase();

  // --------------------------------
  // Show only current provider services
  // --------------------------------
  const myServices = allServices.filter(
    (service) => {
      if (
        !service ||
        typeof service !== "object"
      ) {
        return false;
      }

      const serviceProviderEmail =
        String(
          service.providerEmail ||
            service.email ||
            service.providerId ||
            ""
        )
          .trim()
          .toLowerCase();

      return (
        serviceProviderEmail ===
        providerEmail
      );
    }
  );

  // --------------------------------
  // Delete service
  // --------------------------------
  const deleteService = (id) => {
    if (!id) {
      return;
    }

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this service?"
      );

    if (!confirmDelete) {
      return;
    }

    // Make sure provider still exists
    if (!providerEmail) {
      alert(
        "Your provider account could not be found."
      );

      navigate("/login");
      return;
    }

    // Find service
    const serviceToDelete =
      allServices.find(
        (service) =>
          service &&
          service.id === id
      );

    if (!serviceToDelete) {
      alert(
        "Service not found."
      );
      return;
    }

    // Ownership check
    const serviceOwnerEmail =
      String(
        serviceToDelete.providerEmail ||
          serviceToDelete.email ||
          serviceToDelete.providerId ||
          ""
      )
        .trim()
        .toLowerCase();

    if (
      serviceOwnerEmail !==
      providerEmail
    ) {
      alert(
        "You can only delete your own services."
      );
      return;
    }

    // Remove only the provider's own service
    const updatedServices =
      allServices.filter(
        (service) => {
          if (
            !service ||
            service.id !== id
          ) {
            return true;
          }

          const ownerEmail =
            String(
              service.providerEmail ||
                service.email ||
                service.providerId ||
                ""
            )
              .trim()
              .toLowerCase();

          return (
            ownerEmail !==
            providerEmail
          );
        }
      );

    try {
      localStorage.setItem(
        "providerServices",
        JSON.stringify(
          updatedServices
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete service:",
        error
      );

      alert(
        "Could not delete the service."
      );

      return;
    }

    // Update UI without page reload
    setAllServices(
      updatedServices
    );

    // Notify other components
    window.dispatchEvent(
      new Event("servicesUpdated")
    );

    alert(
      "Service deleted successfully! ✅"
    );
  };

  // --------------------------------
  // Invalid session
  // --------------------------------
  if (!user) {
    return (
      <div className="services-page">
        <div className="empty-orders">
          <div className="empty-icon">
            🔐
          </div>

          <h3>
            Login Required
          </h3>

          <p>
            Please login as a provider
            to manage your services.
          </p>

          <button
            className="dashboard-btn"
            onClick={() =>
              navigate("/login")
            }
          >
            Login →
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------
  // Customer / non-provider
  // --------------------------------
  if (!isProvider) {
    return (
      <div className="services-page">
        <div className="empty-orders">
          <div className="empty-icon">
            🚫
          </div>

          <h3>
            Provider Access Only
          </h3>

          <p>
            Only providers can manage
            their services.
          </p>

          <button
            className="dashboard-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">

      {/* Header */}
      <div className="services-header">
        <p>
          KHADAMATX PROVIDER
        </p>

        <h1>
          My Services
        </h1>

        <span>
          Manage the services you offer
          to customers.
        </span>
      </div>

      {/* Top Actions */}
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "25px",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong>
            {myServices.length}
          </strong>{" "}
          service
          {myServices.length !== 1
            ? "s"
            : ""}{" "}
          published
        </div>

        <Link
          to="/offer-service"
          className="dashboard-btn"
        >
          + Offer New Service
        </Link>
      </div>

      {/* Services */}
      <div className="services-grid">

        {myServices.length === 0 ? (
          <div className="empty-orders">

            <div className="empty-icon">
              🛠️
            </div>

            <h3>
              No Services Yet
            </h3>

            <p>
              You haven't published any
              services yet. Start offering
              your skills to customers.
            </p>

            <Link
              to="/offer-service"
              className="dashboard-btn"
            >
              Offer Your Service →
            </Link>

          </div>
        ) : (
          myServices.map(
            (service) => {

              const status =
                String(
                  service.status ||
                    "Active"
                ).trim();

              const normalizedStatus =
                status.toLowerCase();

              const isActive =
                normalizedStatus ===
                "active";

              const price =
                Number(service.price);

              return (
                <div
                  className="service-card"
                  key={service.id}
                >

                  {/* Icon */}
                  <div className="service-icon">
                    🛠️
                  </div>

                  {/* Title */}
                  <h2>
                    {String(
                      service.title ||
                        "Untitled Service"
                    )}
                  </h2>

                  {/* Category */}
                  <div
                    style={{
                      fontSize: "14px",
                      marginBottom:
                        "10px",
                      opacity: 0.8,
                    }}
                  >
                    {String(
                      service.category ||
                        "Other"
                    )}
                  </div>

                  {/* Description */}
                  <p>
                    {String(
                      service.description ||
                        "No description available."
                    )}
                  </p>

                  {/* Provider */}
                  <small
                    style={{
                      display:
                        "block",
                      marginTop:
                        "10px",
                      opacity: 0.7,
                    }}
                  >
                    Provider:{" "}
                    {String(
                      service.provider ||
                        user.name ||
                        "Provider"
                    )}
                  </small>

                  {/* Status */}
                  <div
                    style={{
                      marginTop:
                        "12px",
                      marginBottom:
                        "15px",
                    }}
                  >
                    <span
                      style={{
                        display:
                          "inline-block",
                        padding:
                          "5px 12px",
                        borderRadius:
                          "20px",
                        fontSize:
                          "12px",
                        background:
                          isActive
                            ? "#dcfce7"
                            : "#fee2e2",
                        color:
                          isActive
                            ? "#166534"
                            : "#991b1b",
                      }}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Bottom */}
                  <div className="service-bottom">

                    <strong>
                      $
                      {Number.isFinite(
                        price
                      )
                        ? price
                        : 0}
                    </strong>

                    <div
                      style={{
                        display:
                          "flex",
                        gap: "8px",
                        flexWrap:
                          "wrap",
                      }}
                    >

                      {/* Edit */}
                      <Link
                        to={`/edit-service/${encodeURIComponent(
                          String(
                            service.id
                          )
                        )}`}
                        className="login-btn"
                      >
                        Edit
                      </Link>

                      {/* Delete */}
                      <button
                        type="button"
                        className="register-btn"
                        onClick={() =>
                          deleteService(
                            service.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>
              );
            }
          )
        )}

      </div>
    </div>
  );
}

export default MyServices;