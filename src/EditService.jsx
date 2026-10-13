import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --------------------------------
  // Safe JSON parser
  // --------------------------------
  const readJSON = (key, fallback) => {
    try {
      const saved = localStorage.getItem(key);

      if (!saved) {
        return fallback;
      }

      const parsed = JSON.parse(saved);

      return parsed;
    } catch (error) {
      console.error(
        `Failed to read ${key}:`,
        error
      );

      return fallback;
    }
  };

  // --------------------------------
  // Current user
  // --------------------------------
  const savedUser =
    localStorage.getItem("user");

  let user = null;

  try {
    if (savedUser) {
      const parsedUser =
        JSON.parse(savedUser);

      if (
        parsedUser &&
        typeof parsedUser === "object"
      ) {
        user = parsedUser;
      }
    }
  } catch (error) {
    console.error(
      "Failed to read user:",
      error
    );
  }

  // --------------------------------
  // Services
  // --------------------------------
  const allServices = Array.isArray(
    readJSON("providerServices", [])
  )
    ? readJSON("providerServices", [])
    : [];

  // --------------------------------
  // Normalize provider email
  // --------------------------------
  const providerEmail = String(
    user?.email || ""
  )
    .trim()
    .toLowerCase();

  const userRole = String(
    user?.role || ""
  )
    .trim()
    .toLowerCase();

  // --------------------------------
  // Find only this provider's service
  // --------------------------------
  const service = allServices.find(
    (item) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return false;
      }

      const serviceId =
        String(item.id);

      const serviceProviderEmail =
        String(
          item.providerEmail ||
            item.email ||
            item.providerId ||
            ""
        )
          .trim()
          .toLowerCase();

      return (
        serviceId === String(id) &&
        serviceProviderEmail ===
          providerEmail
      );
    }
  );

  // --------------------------------
  // Form state
  // --------------------------------
  const [title, setTitle] = useState(
    service?.title || ""
  );

  const [category, setCategory] =
    useState(
      service?.category || ""
    );

  const [price, setPrice] =
    useState(
      service?.price ?? ""
    );

  const [description, setDescription] =
    useState(
      service?.description || ""
    );

  const [status, setStatus] =
    useState(
      service?.status || "Active"
    );

  // --------------------------------
  // Update service
  // --------------------------------
  const handleUpdate = (e) => {
    e.preventDefault();

    // User check
    if (!user || !providerEmail) {
      alert(
        "Please login as a provider first ❌"
      );

      navigate("/login");
      return;
    }

    // Role check
    if (userRole !== "provider") {
      alert(
        "Only providers can edit services ❌"
      );

      navigate("/dashboard");
      return;
    }

    // Service check
    if (!service) {
      alert(
        "Service not found ❌"
      );
      return;
    }

    // --------------------------------
    // Validate title
    // --------------------------------
    const cleanTitle =
      title.trim();

    if (!cleanTitle) {
      alert(
        "Please enter a service title."
      );
      return;
    }

    if (cleanTitle.length < 3) {
      alert(
        "Service title must be at least 3 characters."
      );
      return;
    }

    if (cleanTitle.length > 100) {
      alert(
        "Service title must be 100 characters or less."
      );
      return;
    }

    // --------------------------------
    // Validate category
    // --------------------------------
    const cleanCategory =
      category.trim();

    if (!cleanCategory) {
      alert(
        "Please select a category."
      );
      return;
    }

    // --------------------------------
    // Validate price
    // --------------------------------
    const numericPrice =
      Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      alert(
        "Please enter a valid service price."
      );
      return;
    }

    if (numericPrice > 1000000) {
      alert(
        "Service price is too high."
      );
      return;
    }

    const cleanPrice =
      Math.round(
        numericPrice * 100
      ) / 100;

    // --------------------------------
    // Validate description
    // --------------------------------
    const cleanDescription =
      description.trim();

    if (!cleanDescription) {
      alert(
        "Please enter a service description."
      );
      return;
    }

    if (cleanDescription.length < 20) {
      alert(
        "Service description must be at least 20 characters."
      );
      return;
    }

    if (cleanDescription.length > 2000) {
      alert(
        "Service description must be 2000 characters or less."
      );
      return;
    }

    // --------------------------------
    // Normalize status
    // --------------------------------
    const cleanStatus =
      status === "Inactive"
        ? "Inactive"
        : "Active";

    // --------------------------------
    // Prevent duplicate title
    // --------------------------------
    const duplicateService =
      allServices.some(
        (item) => {
          if (
            !item ||
            typeof item !== "object"
          ) {
            return false;
          }

          // Ignore current service
          if (
            String(item.id) ===
            String(id)
          ) {
            return false;
          }

          const itemOwnerEmail =
            String(
              item.providerEmail ||
                item.email ||
                item.providerId ||
                ""
            )
              .trim()
              .toLowerCase();

          const itemTitle =
            String(
              item.title || ""
            )
              .trim()
              .toLowerCase();

          return (
            itemOwnerEmail ===
              providerEmail &&
            itemTitle ===
              cleanTitle.toLowerCase()
          );
        }
      );

    if (duplicateService) {
      alert(
        "You already have another service with this title."
      );
      return;
    }

    // --------------------------------
    // Update timestamp
    // --------------------------------
    const now =
      new Date().toISOString();

    // --------------------------------
    // Update only current provider service
    // --------------------------------
    const updatedServices =
      allServices.map(
        (item) => {
          if (
            !item ||
            String(item.id) !==
              String(id)
          ) {
            return item;
          }

          const itemOwnerEmail =
            String(
              item.providerEmail ||
                item.email ||
                item.providerId ||
                ""
            )
              .trim()
              .toLowerCase();

          // Ownership protection
          if (
            itemOwnerEmail !==
            providerEmail
          ) {
            return item;
          }

          return {
            ...item,

            // Service information
            title: cleanTitle,
            category: cleanCategory,
            price: cleanPrice,
            description:
              cleanDescription,
            status: cleanStatus,

            // Provider information
            providerId:
              item.providerId ||
              user.id ||
              providerEmail,

            provider:
              item.provider ||
              user.name ||
              "Provider",

            providerEmail,

            email:
              item.email ||
              providerEmail,

            // Service type
            type:
              item.type ||
              "provider",

            // Keep existing statistics
            orders:
              Number.isFinite(
                Number(item.orders)
              )
                ? Number(item.orders)
                : 0,

            rating:
              Number.isFinite(
                Number(item.rating)
              )
                ? Number(item.rating)
                : 0,

            // Dates
            createdAt:
              item.createdAt ||
              item.date ||
              now,

            date:
              item.date ||
              item.createdAt ||
              now,

            updatedAt: now,
          };
        }
      );

    // --------------------------------
    // Verify update actually happened
    // --------------------------------
    const updatedService =
      updatedServices.find(
        (item) =>
          item &&
          String(item.id) ===
            String(id) &&
          String(
            item.providerEmail ||
              item.email ||
              item.providerId ||
              ""
          )
            .trim()
            .toLowerCase() ===
            providerEmail
      );

    if (!updatedService) {
      alert(
        "You do not have permission to update this service."
      );
      return;
    }

    // --------------------------------
    // Save
    // --------------------------------
    try {
      localStorage.setItem(
        "providerServices",
        JSON.stringify(
          updatedServices
        )
      );
    } catch (error) {
      console.error(
        "Failed to save service:",
        error
      );

      alert(
        "Could not save the changes."
      );

      return;
    }

    // --------------------------------
    // Notify application
    // --------------------------------
    window.dispatchEvent(
      new Event("servicesUpdated")
    );

    // --------------------------------
    // Success
    // --------------------------------
    alert(
      "Service updated successfully! ✅"
    );

    navigate("/my-services");
  };

  // --------------------------------
  // Service not found
  // --------------------------------
  if (!user) {
    return (
      <div className="services-page">
        <div className="services-header">
          <p>
            KHADAMATX PROVIDER
          </p>

          <h1>
            Login Required
          </h1>

          <span>
            Please login as a provider
            to edit your service.
          </span>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
          }}
        >
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

  if (!service) {
    return (
      <div className="services-page">

        <div className="services-header">
          <p>
            KHADAMATX PROVIDER
          </p>

          <h1>
            Service Not Found ❌
          </h1>

          <span>
            This service does not exist or
            you don't have permission to
            edit it.
          </span>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
          }}
        >
          <button
            className="dashboard-btn"
            onClick={() =>
              navigate("/my-services")
            }
          >
            ← Back to My Services
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="offer-service-page">

      <div className="offer-service-container">

        {/* Header */}
        <div className="offer-header">

          <span>
            KHADAMATX PROVIDER
          </span>

          <h1>
            Edit Your Service
          </h1>

          <p>
            Update your service information
            and keep it accurate for customers.
          </p>

        </div>

        {/* Form Card */}
        <div className="offer-service-card">

          <form
            onSubmit={handleUpdate}
          >

            {/* Service Title */}
            <div className="form-group">

              <label>
                Service Title
              </label>

              <input
                type="text"
                placeholder="e.g. Professional Web Development"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                maxLength={100}
                required
              />

            </div>

            {/* Category */}
            <div className="form-group">

              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                required
              >

                <option value="">
                  Select a category
                </option>

                <option value="Web Development">
                  Web Development
                </option>

                <option value="Graphic Design">
                  Graphic Design
                </option>

                <option value="Mobile App Development">
                  Mobile App Development
                </option>

                <option value="Digital Marketing">
                  Digital Marketing
                </option>

                <option value="Video Editing">
                  Video Editing
                </option>

                <option value="Computer Services">
                  Computer Services
                </option>

                <option value="Translation">
                  Translation
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

            {/* Price */}
            <div className="form-group">

              <label>
                Starting Price ($)
              </label>

              <input
                type="number"
                min="1"
                max="1000000"
                step="0.01"
                placeholder="e.g. 25"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
                required
              />

            </div>

            {/* Status */}
            <div className="form-group">

              <label>
                Service Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
              >

                <option value="Active">
                  Active — Visible to customers
                </option>

                <option value="Inactive">
                  Inactive — Hidden from customers
                </option>

              </select>

            </div>

            {/* Description */}
            <div className="form-group">

              <label>
                Service Description
              </label>

              <textarea
                rows="6"
                placeholder="Describe your service, delivery time, features, and what the customer will receive..."
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                maxLength={2000}
                required
              />

            </div>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >

              <button
                type="submit"
                className="order-submit-btn"
              >
                Update Service →
              </button>

              <button
                type="button"
                className="register-btn"
                onClick={() =>
                  navigate(
                    "/my-services"
                  )
                }
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default EditService;