import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminReviews.css";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");

  const loadReviews = () => {
    const orders =
      JSON.parse(localStorage.getItem("orders")) || [];

    const reviewedOrders = orders.filter(
      (order) =>
        order.reviewed === true ||
        order.rating ||
        order.review
    );

    setReviews(reviewedOrders);
  };

  useEffect(() => {
    loadReviews();

    window.addEventListener(
      "ordersUpdated",
      loadReviews
    );

    return () => {
      window.removeEventListener(
        "ordersUpdated",
        loadReviews
      );
    };
  }, []);

  const deleteReview = (orderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) return;

    const orders =
      JSON.parse(localStorage.getItem("orders")) || [];

    const updatedOrders = orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            rating: null,
            review: "",
            reviewed: false,
            reviewDate: null,
          }
        : order
    );

    localStorage.setItem(
      "orders",
      JSON.stringify(updatedOrders)
    );

    setReviews((prev) =>
      prev.filter(
        (review) => review.id !== orderId
      )
    );

    window.dispatchEvent(
      new Event("ordersUpdated")
    );
  };

  const filteredReviews = reviews.filter(
    (review) => {
      const searchText =
        `${review.service || ""} ${
          review.customerName || ""
        } ${
          review.customerEmail || ""
        } ${
          review.provider || ""
        } ${
          review.review || ""
        }`.toLowerCase();

      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );

      const matchesRating =
        ratingFilter === "All" ||
        String(review.rating) === ratingFilter;

      return (
        matchesSearch &&
        matchesRating
      );
    }
  );

  const renderStars = (rating) => {
    const value = Number(rating) || 0;

    return (
      <div className="admin-review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= value ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="admin-reviews-page">

      {/* HEADER */}

      <div className="admin-reviews-header">

        <div>
          <span className="admin-label">
            KHADAMATX ADMIN
          </span>

          <h1>
            Reviews Management
          </h1>

          <p>
            Monitor customer reviews and ratings.
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

      <div className="reviews-toolbar">

        <input
          type="text"
          placeholder="Search reviews..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={ratingFilter}
          onChange={(e) =>
            setRatingFilter(e.target.value)
          }
        >
          <option value="All">
            All Ratings
          </option>

          <option value="5">
            5 Stars
          </option>

          <option value="4">
            4 Stars
          </option>

          <option value="3">
            3 Stars
          </option>

          <option value="2">
            2 Stars
          </option>

          <option value="1">
            1 Star
          </option>
        </select>

        <span>
          {filteredReviews.length} Reviews
        </span>

      </div>


      {/* REVIEWS TABLE */}

      <div className="reviews-table-wrapper">

        <table className="reviews-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Provider</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredReviews.length > 0 ? (

              filteredReviews.map(
                (review, index) => (

                  <tr
                    key={
                      review.id ||
                      `${review.customerEmail}-${index}`
                    }
                  >

                    <td>
                      {index + 1}
                    </td>

                    <td>

                      <div className="review-customer">

                        <strong>
                          {review.customerName ||
                            "Unknown"}
                        </strong>

                        <small>
                          {review.customerEmail ||
                            "No email"}
                        </small>

                      </div>

                    </td>

                    <td>
                      {review.service ||
                        "Unknown Service"}
                    </td>

                    <td>
                      {review.provider ||
                        "Unknown"}
                    </td>

                    <td>
                      {renderStars(
                        review.rating
                      )}

                      <small>
                        {review.rating || 0}/5
                      </small>
                    </td>

                    <td>
                      <div className="review-text">
                        {review.review ||
                          "No review text"}
                      </div>
                    </td>

                    <td>
                      {review.reviewDate
                        ? new Date(
                            review.reviewDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td>

                      <button
                        type="button"
                        className="delete-review-btn"
                        onClick={() =>
                          deleteReview(
                            review.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                )
              )

            ) : (

              <tr>

                <td
                  colSpan="8"
                  className="no-reviews"
                >
                  No reviews found.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default AdminReviews;
