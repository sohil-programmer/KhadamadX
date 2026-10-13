
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Services.css";

function Services() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  // =========================
  // Default Services
  // =========================
  const defaultServices = [
    {
      id: "web-development",
      title: "Web Development",
      category: "Web Development",
      description:
        "Professional and responsive websites for businesses, portfolios, and online services.",
      price: 25,
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
      description:
        "Creative logos, social media designs, banners, and professional graphics.",
      price: 15,
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
      description:
        "Modern mobile applications designed for Android and iOS platforms.",
      price: 50,
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
      description:
        "Digital marketing services to help businesses grow their online presence.",
      price: 20,
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
      description:
        "Professional video editing for YouTube, social media, business, and personal projects.",
      price: 20,
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
      description:
        "Computer setup, software installation, troubleshooting, and technical support.",
      price: 10,
      provider: "KhadamatX",
      providerId: "khadamatx",
      providerEmail: "",
      icon: "🖥️",
      delivery: "1–3 Days",
      type: "default",
    },
  ];

  // =========================
  // Provider Services
  // =========================
  let providerServices = [];

  try {
    const savedServices = JSON.parse(
      localStorage.getItem("providerServices") || "[]"
    );

    if (Array.isArray(savedServices)) {
      providerServices = savedServices;
    }
  } catch (error) {
    console.error("Unable to load provider services:", error);
    providerServices = [];
  }

  const activeProviderServices = providerServices
    .filter((service) => {
      if (!service || typeof service !== "object") {
        return false;
      }

      const status = String(service.status || "Active")
        .trim()
        .toLowerCase();

      return status === "active";
    })
    .map((service) => ({
      ...service,
      type: "provider",
      title:
        typeof service.title === "string" && service.title.trim()
          ? service.title.trim()
          : "Professional Service",
      category:
        typeof service.category === "string" && service.category.trim()
          ? service.category.trim()
          : "Other",
      description:
        typeof service.description === "string" &&
        service.description.trim()
          ? service.description.trim()
          : "Professional service provided by a KhadamatX provider.",
      provider:
        typeof service.provider === "string" && service.provider.trim()
          ? service.provider.trim()
          : "KhadamatX",
      icon: service.icon || "🛠️",
      delivery: service.delivery || "3–7 Days",
      providerEmail:
        typeof service.providerEmail === "string"
          ? service.providerEmail.trim().toLowerCase()
          : typeof service.email === "string"
          ? service.email.trim().toLowerCase()
          : "",
    }));

  // =========================
  // Combine Services
  // =========================
  const services = [
    ...defaultServices,
    ...activeProviderServices,
  ];

  // =========================
  // Categories
  // =========================
  const categories = [
    "All",
    ...new Set(
      services
        .map((service) => service.category)
        .filter(Boolean)
    ),
  ];

  // =========================
  // Orders / Reviews
  // =========================
  let allOrders = [];

  try {
    const savedOrders = JSON.parse(
      localStorage.getItem("orders") || "[]"
    );

    if (Array.isArray(savedOrders)) {
      allOrders = savedOrders;
    }
  } catch (error) {
    console.error("Unable to load orders:", error);
    allOrders = [];
  }

  // =========================
  // Get Service Rating
  // =========================
  const getServiceRating = (service) => {
    const reviews = allOrders.filter(
      (order) =>
        order &&
        String(order.serviceId) === String(service.id) &&
        order.reviewed === true &&
        Number(order.rating) > 0
    );

    if (reviews.length === 0) {
      return {
        average: "0.0",
        count: 0,
      };
    }

    const total = reviews.reduce(
      (sum, order) => sum + Number(order.rating),
      0
    );

    return {
      average: (total / reviews.length).toFixed(1),
      count: reviews.length,
    };
  };

  // =========================
  // Provider URL
  // =========================
  const getProviderUrl = (service) => {
    const providerId =
      service.providerEmail ||
      service.email ||
      service.providerId ||
      service.provider ||
      "khadamatx";

    return `/provider/${encodeURIComponent(
      String(providerId)
    )}`;
  };

  // =========================
  // Filter + Search + Sort
  // =========================
  const filteredServices = services
    .filter((service) => {
      const title = String(service.title || "");
      const description = String(service.description || "");
      const serviceCategory = String(service.category || "");
      const provider = String(service.provider || "");

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        title.toLowerCase().includes(searchText) ||
        description.toLowerCase().includes(searchText) ||
        serviceCategory.toLowerCase().includes(searchText) ||
        provider.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" ||
        serviceCategory === category;

      const numericPrice = Number(service.price);

      const matchesPrice =
        priceFilter === "All" ||
        (priceFilter === "under20" &&
          Number.isFinite(numericPrice) &&
          numericPrice < 20) ||
        (priceFilter === "20to50" &&
          Number.isFinite(numericPrice) &&
          numericPrice >= 20 &&
          numericPrice <= 50) ||
        (priceFilter === "over50" &&
          Number.isFinite(numericPrice) &&
          numericPrice > 50);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice
      );
    })
    .sort((a, b) => {
      if (sortBy === "low") {
        return Number(a.price) - Number(b.price);
      }

      if (sortBy === "high") {
        return Number(b.price) - Number(a.price);
      }

      if (sortBy === "name") {
        return String(a.title || "").localeCompare(
          String(b.title || "")
        );
      }

      return 0;
    });

  // =========================
  // Clear Filters
  // =========================
  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setPriceFilter("All");
    setSortBy("default");
  };

  return (
    <div className="services-page">

      {/* =========================
          Header
      ========================= */}
      <div className="services-header">

        <div className="services-label">
          KHADAMATX SERVICES
        </div>

        <h1>
          Find the Right Service
        </h1>

        <p>
          Discover professional services from
          trusted KhadamatX providers.
        </p>

        {/* =========================
            Main Search
        ========================= */}
        <div className="service-filters">

          {/* Search */}
          <div className="filter-search">

            <div className="filter-icon">
              🔍
            </div>

            <div className="filter-input-area">

              <label>
                Search Services
              </label>

              <input
                type="text"
                placeholder="What service are you looking for?"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>
          </div>

          <div className="filter-divider"></div>

          {/* Category */}
          <div className="filter-category">

            <div className="category-icon">
              ▦
            </div>

            <div className="filter-select-area">

              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >
                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item === "All"
                      ? "All Categories"
                      : item}
                  </option>
                ))}
              </select>

            </div>
          </div>

        </div>

        {/* =========================
            Advanced Filters
        ========================= */}
        <div className="advanced-filters">

          {/* Price */}
          <div className="advanced-filter">

            <label>
              Price
            </label>

            <select
              value={priceFilter}
              onChange={(e) =>
                setPriceFilter(e.target.value)
              }
            >
              <option value="All">
                All Prices
              </option>

              <option value="under20">
                Under $20
              </option>

              <option value="20to50">
                $20 - $50
              </option>

              <option value="over50">
                Over $50
              </option>
            </select>

          </div>

          {/* Sort */}
          <div className="advanced-filter">

            <label>
              Sort By
            </label>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
            >
              <option value="default">
                Recommended
              </option>

              <option value="low">
                Price: Low to High
              </option>

              <option value="high">
                Price: High to Low
              </option>

              <option value="name">
                Name: A-Z
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* =========================
          Result Bar
      ========================= */}
      <div className="services-result-bar">

        <div>
          <strong>
            {filteredServices.length}
          </strong>{" "}
          services available
        </div>

        {(search ||
          category !== "All" ||
          priceFilter !== "All" ||
          sortBy !== "default") && (
          <button onClick={clearFilters}>
            Clear Filters
          </button>
        )}

      </div>

      {/* =========================
          Services Grid
      ========================= */}
      <div className="services-grid">

        {filteredServices.length === 0 ? (

          <div className="services-empty">

            <div className="empty-icon">
              🔍
            </div>

            <h3>
              No Services Found
            </h3>

            <p>
              Try another keyword, category,
              or price range.
            </p>

            <button onClick={clearFilters}>
              Show All Services
            </button>

          </div>

        ) : (

          filteredServices.map((service) => {

            const rating = getServiceRating(service);

            const numericPrice = Number(service.price);

            const displayPrice =
              Number.isFinite(numericPrice)
                ? numericPrice
                : "N/A";

            return (
              <div
                className="service-card"
                key={`${service.type || "service"}-${service.id}`}
              >

                {/* Card Top */}
                <div className="service-card-top">

                  <div className="service-icon">
                    {service.icon}
                  </div>

                  <span className="service-category">
                    {service.category}
                  </span>

                </div>

                {/* Content */}
                <div className="service-content">

                  <h2>
                    {service.title}
                  </h2>

                  <p>
                    {service.description}
                  </p>

                </div>

                {/* Rating */}
                <div className="service-rating">

                  <span className="service-rating-stars">
                    {rating.count > 0
                      ? "★".repeat(
                          Math.min(
                            5,
                            Math.max(
                              1,
                              Math.round(
                                Number(rating.average)
                              )
                            )
                          )
                        )
                      : "☆"}
                  </span>

                  <strong>
                    {rating.count > 0
                      ? rating.average
                      : "New"}
                  </strong>

                  <span className="service-rating-count">
                    {rating.count > 0
                      ? `(${rating.count} ${
                          rating.count === 1
                            ? "review"
                            : "reviews"
                        })`
                      : "No reviews yet"}
                  </span>

                </div>

                {/* Service Info */}
                <div className="service-info">

                  {/* Provider */}
                  <div>

                    <span>
                      Provider
                    </span>

                    <strong>

                      <Link
                        to={getProviderUrl(service)}
                        className="provider-link"
                      >
                        {service.provider || "KhadamatX"}
                      </Link>

                    </strong>

                  </div>

                  {/* Delivery */}
                  <div>

                    <span>
                      Delivery
                    </span>

                    <strong>
                      {service.delivery || "3–7 Days"}
                    </strong>

                  </div>

                </div>

                {/* Bottom */}
                <div className="service-bottom">

                  <div className="service-price">

                    <span>
                      Starting from
                    </span>

                    <strong>
                      {displayPrice === "N/A"
                        ? displayPrice
                        : `$${displayPrice}`}
                    </strong>

                  </div>

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
                    <span>→</span>
                  </Link>

                </div>

              </div>
            );
          })

        )}

      </div>

    </div>
  );
}

export default Services;