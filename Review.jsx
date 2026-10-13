
import { useState } from "react";
import "./Review.css";

function Review({ order, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  // ==========================================
  // Submit Review
  // ==========================================
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check Rating
    if (rating === 0) {
      alert("Please select a rating ⭐");
      return;
    }

    // Check Review
    if (!review.trim()) {
      alert("Please write a review.");
      return;
    }

    // Get All Orders
    const allOrders =
      JSON.parse(localStorage.getItem("orders")) || [];

    // Update Selected Order
    const updatedOrders = allOrders.map((item) => {
      if (String(item.id) === String(order.id)) {
        return {
          ...item,

          // ⭐ Rating
          rating: Number(rating),

          // 📝 Review
          review: review.trim(),

          // ✅ Review Status
          reviewed: true,

          // 📅 Review Date
          reviewDate: new Date().toLocaleString(),
        };
      }

      return item;
    });

    // Save Orders
    localStorage.setItem(
      "orders",
      JSON.stringify(updatedOrders)
    );

    // Notify Dashboard
    window.dispatchEvent(
      new Event("ordersUpdated")
    );

    // Success Message
    alert("Thank you for your review! ⭐");

    // Refresh Dashboard
    if (onReviewSubmitted) {
      onReviewSubmitted();
    }
  };

  return (
    <div className="review-box">

      {/* =====================================
          Review Header
      ====================================== */}
      <div className="review-title">

        <span>
          RATE YOUR EXPERIENCE
        </span>

        <h3>
          How was the service?
        </h3>

        <p>
          Your feedback helps other customers
          choose better services.
        </p>

      </div>

      {/* =====================================
          Rating Stars
      ====================================== */}
      <div className="rating-stars">

        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={
              star <= rating
                ? "star active"
                : "star"
            }
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} out of 5`}
          >
            ★
          </button>
        ))}

      </div>

      {/* Selected Rating */}
      {rating > 0 && (
        <div className="rating-text">

          {rating === 1 && "Poor 😞"}
          {rating === 2 && "Fair 😕"}
          {rating === 3 && "Good 🙂"}
          {rating === 4 && "Very Good 😄"}
          {rating === 5 && "Excellent 🤩"}

        </div>
      )}

      {/* =====================================
          Review Form
      ====================================== */}
      <form
        onSubmit={handleSubmit}
        className="review-form"
      >

        <div className="review-form-group">

          <label>
            Your Review
          </label>

          <textarea
            value={review}
            onChange={(e) =>
              setReview(e.target.value)
            }
            placeholder="Tell us about your experience..."
            rows="4"
            maxLength="500"
          />

          <small>
            {review.length}/500
          </small>

        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="dashboard-btn review-submit-btn"
        >
          Submit Review ⭐
        </button>

      </form>

    </div>
  );
}

export default Review;
