import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminServices.css";

function AdminServices() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");

  const defaultServices = [
    {
      id: 1,
      title: "Web Development",
      category: "Web Development",
      price: 25,
      provider: "KhadamatX",
      type: "default",
    },
    {
      id: 2,
      title: "Graphic Design",
      category: "Graphic Design",
      price: 15,
      provider: "KhadamatX",
      type: "default",
    },
    {
      id: 3,
      title: "Mobile App Development",
      category: "Mobile App Development",
      price: 50,
      provider: "KhadamatX",
      type: "default",
    },
    {
      id: 4,
      title: "Digital Marketing",
      category: "Digital Marketing",
      price: 20,
      provider: "KhadamatX",
      type: "default",
    },
    {
      id: 5,
      title: "Video Editing",
      category: "Video Editing",
      price: 20,
      provider: "KhadamatX",
      type: "default",
    },
    {
      id: 6,
      title: "Computer Services",
      category: "Computer Services",
      price: 10,
      provider: "KhadamatX",
      type: "default",
    },
  ];

  // =========================
  // LOAD SERVICES
  // =========================

  const loadServices = () => {
    const providerServices =
      JSON.parse(
        localStorage.getItem("providerServices")
      ) || [];

    const formattedProviderServices =
      providerServices.map((service) => ({
        ...service,
        type: "provider",
      }));

    setServices([
      ...defaultServices,
      ...formattedProviderServices,
    ]);
  };

  useEffect(() => {
    loadServices();

    window.addEventListener(
      "servicesUpdated",
      loadServices
    );

    return () => {
      window.removeEventListener(
        "servicesUpdated",
        loadServices
      );
    };
  }, []);

  // =========================
  // DELETE SERVICE
  // =========================

  const deleteService = (service) => {
    if (service.type === "default") {
      alert(
        "Default marketplace services cannot be deleted ❌"
      );
      return;
    }

    const confirmDelete = window.confirm(
      `Delete "${service.title}"?`
    );

    if (!confirmDelete) return;

    const providerServices =
      JSON.parse(
        localStorage.getItem("providerServices")
      ) || [];

    const updatedServices =
      providerServices.filter(
        (item) => item.id !== service.id
      );

    localStorage.setItem(
      "providerServices",
      JSON.stringify(updatedServices)
    );

    setServices((prev) =>
      prev.filter(
        (item) => item.id !== service.id
      )
    );

    window.dispatchEvent(
      new Event("servicesUpdated")
    );
  };

  // =========================
  // SEARCH
  // =========================

  const filteredServices =
    services.filter((service) => {

      const text =
        `${service.title} ${service.category} ${service.provider}`
          .toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    });

  return (
    <div className="admin-services-page">

      {/* HEADER */}

      <div className="admin-services-header">

        <div>

          <span className="admin-label">
            KHADAMATX ADMIN
          </span>

          <h1>
            Services Management
          </h1>

          <p>
            Manage marketplace services and
            provider services.
          </p>

        </div>

        <Link
          to="/admin"
          className="back-admin-btn"
        >
          ← Admin Dashboard
        </Link>

      </div>

      {/* TOOLBAR */}

      <div className="services-toolbar">

        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <span>
          {filteredServices.length} Services
        </span>

      </div>

      {/* TABLE */}

      <div className="services-table-wrapper">

        <table className="services-table">

          <thead>

            <tr>

              <th>#</th>

              <th>Service</th>

              <th>Category</th>

              <th>Provider</th>

              <th>Price</th>

              <th>Type</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {filteredServices.length > 0 ? (

              filteredServices.map(
                (service, index) => (

                  <tr key={service.id}>

                    <td>
                      {index + 1}
                    </td>

                    <td>

                      <strong>
                        {service.title}
                      </strong>

                    </td>

                    <td>
                      {service.category}
                    </td>

                    <td>
                      {service.provider ||
                        "Unknown"}
                    </td>

                    <td>
                      ${service.price}
                    </td>

                    <td>

                      <span
                        className={
                          service.type ===
                          "provider"
                            ? "service-type provider"
                            : "service-type default"
                        }
                      >
                        {service.type ===
                        "provider"
                          ? "Provider"
                          : "Default"}
                      </span>

                    </td>

                    <td>

                      {service.type ===
                      "provider" ? (
                        <button
                          className="delete-service-btn"
                          onClick={() =>
                            deleteService(
                              service
                            )
                          }
                        >
                          Delete
                        </button>
                      ) : (
                        <span className="protected-text">
                          Protected
                        </span>
                      )}

                    </td>

                  </tr>

                )
              )

            ) : (

              <tr>

                <td
                  colSpan="7"
                  className="no-services"
                >
                  No services found.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default AdminServices;
