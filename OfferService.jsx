import { useState } from "react";
import { useNavigate } from "react-router-dom";

function OfferService() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // --------------------------------
  // Safe JSON parser
  // --------------------------------
  const readArrayFromStorage = (key) => {
    try {
      const saved = localStorage.getItem(key);

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(
        `Failed to read ${key}:`,
        error
      );

      return [];
    }
  };

  // --------------------------------
  // Generate unique service ID
  // --------------------------------
  const generateServiceId = () => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }

    return `service-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  };

  // --------------------------------
  // Submit service
  // --------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    // --------------------------------
    // Get current user
    // --------------------------------
    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      alert("Please login first ❌");
      navigate("/login");
      return;
    }

    let user = null;

    try {
      const parsedUser =
        JSON.parse(savedUser);

      if (
        parsedUser &&
        typeof parsedUser === "object"
      ) {
        user = parsedUser;
      }
    } catch (error) {
      console.error(
        "Invalid user session:",
        error
      );
    }

    // --------------------------------
    // Invalid session
    // --------------------------------
    if (!user) {
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");

      alert(
        "Your session is invalid. Please login again."
      );

      navigate("/login");
      return;
    }

    // --------------------------------
    // Provider check
    // --------------------------------
    const userRole = String(
      user.role || ""
    )
      .trim()
      .toLowerCase();

    if (userRole !== "provider") {
      alert(
        "Only providers can offer services ❌"
      );

      navigate("/dashboard");
      return;
    }

    // --------------------------------
    // Normalize provider email
    // --------------------------------
    const providerEmail = String(
      user.email || ""
    )
      .trim()
      .toLowerCase();

    if (!providerEmail) {
      alert(
        "Your account email is missing. Please login again."
      );

      navigate("/login");
      return;
    }

    // --------------------------------
    // Validate title
    // --------------------------------
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      alert("Please enter a service title.");
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
      alert("Please select a category.");
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

    // Keep price clean
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
    // Read existing services safely
    // --------------------------------
    const existingServices =
      readArrayFromStorage(
        "providerServices"
      );

    // --------------------------------
    // Prevent accidental duplicate
    // --------------------------------
    const duplicateService =
      existingServices.some(
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

          const serviceTitle =
            String(
              service.title || ""
            )
              .trim()
              .toLowerCase();

          return (
            serviceProviderEmail ===
              providerEmail &&
            serviceTitle ===
              cleanTitle.toLowerCase()
          );
        }
      );

    if (duplicateService) {
      alert(
        "You already have a service with this title."
      );
      return;
    }

    // --------------------------------
    // Create service
    // --------------------------------
    const now =
      new Date().toISOString();

    const newService = {
      id: generateServiceId(),

      // Service information
      title: cleanTitle,
      category: cleanCategory,
      price: cleanPrice,
      description: cleanDescription,

      // Provider information
      providerId:
        user.id || providerEmail,

      provider:
        String(
          user.name || "Provider"
        ).trim(),

      providerEmail,

      email: providerEmail,

      // Service status
      status: "Active",

      // Service type
      type: "provider",

      // Statistics
      orders: 0,
      rating: 0,

      // Dates
      date: now,
      createdAt: now,
      updatedAt: now,
    };

    // --------------------------------
    // Save service
    // --------------------------------
    const updatedServices = [
      ...existingServices,
      newService,
    ];

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
        "Could not save the service. Your browser storage may be full."
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
      "Your service has been published successfully! ✅"
    );

    navigate("/my-services");
  };

  return (
    <div className="offer-service-page">
      <div className="offer-service-container">

        {/* Header */}
        <div className="offer-header">
          <span>
            KHADAMATX PROVIDER
          </span>

          <h1>
            Offer Your Service
          </h1>

          <p>
            Share your skills and start earning by offering
            your services on KhadamatX.
          </p>
        </div>

        {/* Form Card */}
        <div className="offer-service-card">

          <form
            onSubmit={handleSubmit}
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
                  setTitle(e.target.value)
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
                  setCategory(e.target.value)
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
                  setPrice(e.target.value)
                }
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>
                Service Description
              </label>

              <textarea
                rows="6"
                placeholder="Describe your service, what you provide, delivery time, and what the customer will receive..."
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

            {/* Publish */}
            <button
              type="submit"
              className="order-submit-btn"
            >
              Publish Service →
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}

export default OfferService;