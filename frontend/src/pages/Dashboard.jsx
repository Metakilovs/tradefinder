import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext.jsx";

function StatusPill({ status }) {
  return <span className={`status-pill status-${status}`}>{status}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings/mine");
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update this request");
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    try {
      await api.put(`/bookings/${reviewTarget._id}/review`, {
        rating: ratingValue,
        review: reviewText,
      });
      setReviewTarget(null);
      setReviewText("");
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Could not submit review");
    }
  }

  const isTradesperson = user?.role === "tradesperson";

  return (
    <div className="container dashboard-page">
      <h1>{isTradesperson ? "Job requests" : "My requests"}</h1>

      {loading && <p>Loading...</p>}

      {!loading && bookings.length === 0 && (
        <div className="empty-state">
          {isTradesperson
            ? "No job requests yet. Make sure your profile is set to available."
            : "You haven't requested anyone yet. Go find a tradesperson near you."}
        </div>
      )}

      {bookings.map((b) => (
        <div key={b._id} className="booking-card">
          <div>
            <strong>{isTradesperson ? b.client?.name : b.tradesperson?.name}</strong>
            {isTradesperson && b.client?.phone && <span> &middot; {b.client.phone}</span>}
            <div className="desc">{b.description}</div>
            {b.clientLocation?.address && (
              <div style={{ marginTop: 6, fontSize: 13, color: "#8a8a8a" }}>
                📍 {b.clientLocation.address}
              </div>
            )}
            <div style={{ marginTop: 10 }}>
              <StatusPill status={b.status} />
            </div>
          </div>

          <div className="booking-actions">
            {isTradesperson && b.status === "pending" && (
              <>
                <button className="btn btn-sm" onClick={() => updateStatus(b._id, "accepted")}>
                  Accept
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => updateStatus(b._id, "declined")}
                >
                  Decline
                </button>
              </>
            )}
            {isTradesperson && b.status === "accepted" && (
              <button className="btn btn-sm" onClick={() => updateStatus(b._id, "completed")}>
                Mark completed
              </button>
            )}
            {!isTradesperson && b.status === "completed" && b.rating === 0 && (
              <button className="btn btn-sm" onClick={() => setReviewTarget(b)}>
                Leave a review
              </button>
            )}
            {!isTradesperson && b.rating > 0 && (
              <span className="stars">{"★".repeat(b.rating)}</span>
            )}
          </div>
        </div>
      ))}

      {reviewTarget && (
        <div className="modal-overlay" onClick={() => setReviewTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Rate {reviewTarget.tradesperson?.name}</h2>
            <form onSubmit={submitReview}>
              <div className="field">
                <label>Rating</label>
                <select value={ratingValue} onChange={(e) => setRatingValue(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Review (optional)</label>
                <textarea rows={3} value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-block">
                Submit review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
