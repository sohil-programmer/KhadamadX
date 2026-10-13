
import { Link, useParams } from "react-router-dom";
import "./ServiceDetails.css";

function ServiceDetails() {
  const { id } = useParams();

  // Default KhadamatX services
  const defaultServices = [
    {
      id: "web-development",
      title: "Web Development",
      description:
        "Professional and responsive websites for businesses, portfolios, and online services.",
      price: 25,
      category: "Web Development",
      provider: "KhadamatX",
      providerId: "khadamatx",
      providerEmail: "",
      icon: "💻",
    },
    {
      id: "graphic-design",
      title: "Graphic Design",
      description:
        "Creative logos, social media designs, banners, and professional graphics.",
      price: 15,
      category: "Graphic Design",
      provider: "KhadamatX",
      providerId: "khadamatx",
      providerEmail: "",
      icon: "🎨",
    },
    {
      id: "mobile-app-development",
      title: "Mobile App Development",
      description:
        "Modern mobile applications designed for Android and iOS platforms.",
      price: 50,
      category: "Mobile App Development",
      provider: "KhadamatX",
      providerId: "khadamatx",
      providerEmail: "",
      icon: "📱",
    },
    {
      id: "digital-marketing",
      title: "Digital Marketing",
      description:
        "Digital marketing services to help businesses grow their online presence.",
      price: 20,
      category: "Digital Marketing",
      provider: "KhadamatX",
      providerId: "khadamatx",
      providerEmail: "",
      icon: "📈",
    },
    {
      id: "video-editing",
      title: "Video Editing",
      description:
        "Professional video editing for YouTube, social media, business, and personal projects.",
      price: 20,
      category: "Video Editing",
      provider: "KhadamatX",
      providerId: "khadamatx",
      providerEmail: "",
      icon: "🎬",
    },
    {
      id: "computer-services",
      title: "Computer Services",
      description:
        "Computer setup, software installation, troubleshooting, and technical support.",
      price: 10,
      category: "Computer Services",
      provider: "KhadamatX",
      providerId: "khadamatx",
      providerEmail: "",
      icon: "🖥️",
    },
  ];

  // Safely load provider-created services
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

  // Find default service
  const defaultService = defaultServices.find(
    (service) => String(service.id) === String(id)
  );

  // Find active provider service
  const providerService = providerServices.find(
    (service) =>
      service &&
      String(service.id) === String(id) &&
      (!service.status ||
        String(service.status).trim().toLowerCase() === "active")
  );

  // Provider-created service has priority
  const service = providerService || defaultService;

  // Service not found
  if (!service) {
    return (
      <div className="services-page">
        <div className="services-header">
          <p>KHADAMATX SERVICES</p>

          <h1>Service Not Found ❌</h1>

          <span>
            The service you are looking for does not exist or is no longer
            available.
          </span>

          <br />

          <Link to="/services" className="dashboard-btn">
            ← Back to Services
          </Link>
        </div>
      </div>
    );
  }

  // Safe service values
  const title =
    typeof service.title === "string" && service.title.trim()
      ? service.title.trim()
      : "Professional Service";

  const description =
    typeof service.description === "string" && service.description.trim()
      ? service.description.trim()
      : "Professional service provided by a talented KhadamatX provider.";

  const category =
    typeof service.category === "string" && service.category.trim()
      ? service.category.trim()
      : "Professional Service";

  const providerName =
    typeof service.provider === "string" && service.provider.trim()
      ? service.provider.trim()
      : "KhadamatX";

  const providerEmail =
    typeof service.providerEmail === "string"
      ? service.providerEmail.trim()
      : typeof service.email === "string"
      ? service.email.trim()
      : "";

  const price =
    typeof service.price === "number"
      ? service.price
      : Number(service.price);

  const displayPrice =
    Number.isFinite(price) && price >= 0
      ? `$${price}+`
      : "Price on Request";

  const serviceIcon = service.icon || "🛠️";

  return (
    <div className="service-details-page">
      <div className="service-details-container">

        {/* Back */}
        <Link to="/services" className="back-link">
          ← Back to Services
        </Link>

        {/* Header */}
        <div className="service-details-header">
          <div className="details-icon">
            {serviceIcon}
          </div>

          <div>
            <span className="details-label">
              PROFESSIONAL SERVICE
            </span>

            <h1>{title}</h1>

            <p>{description}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="service-details-grid">

          {/* About */}
          <div className="service-about">
            <span className="details-label">
              ABOUT THIS SERVICE
            </span>

            <h2>
              Professional {title}
            </h2>

            <p>{description}</p>

            <p>
              This service is available through KhadamatX. You can place an
              order and communicate with the provider about your project
              requirements.
            </p>

            {/* Service Information */}
            <div className="service-info-grid">

              <div className="info-box">
                <span>Category</span>
                <strong>{category}</strong>
              </div>

              <div className="info-box">
                <span>Delivery</span>
                <strong>3 - 7 Days</strong>
              </div>

              <div className="info-box">
                <span>Service Type</span>
                <strong>Online</strong>
              </div>

              <div className="info-box">
                <span>Provider</span>
                <strong>{providerName}</strong>
              </div>

            </div>
          </div>

          {/* Order Card */}
          <div className="order-card">

            <span>STARTING PRICE</span>

            <h2>{displayPrice}</h2>

            <p>
              Get started with this professional service today.
            </p>

            <Link
              to={`/order/${encodeURIComponent(String(service.id))}`}
              className="order-now-btn"
              state={{
                service: {
                  ...service,
                  title,
                  description,
                  category,
                  provider: providerName,
                  providerEmail,
                  price: Number.isFinite(price) ? price : service.price,
                },
              }}
            >
              Order Now →
            </Link>

            <button
              type="button"
              className="contact-provider-btn"
              onClick={() => {
                if (providerEmail) {
                  alert(
                    `Provider: ${providerName}\nEmail: ${providerEmail}`
                  );
                } else {
                  alert(
                    `Provider: ${providerName}\nEmail: Not available`
                  );
                }
              }}
            >
              Contact Provider
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetails;
