import React, { useState } from "react";
import api from "../api";

export default function BookingModal({ tradesperson, userLocation, onClose, onSuccess }) {
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!description.trim()) {
      setError("Please describe what you need done");
      return;
    }

    setLoading(true);
    try {
      await api.post("/bookings", {
        tradespersonId: tradesperson._id,
        description,
        address,
        lng: userLocation ? userLocation[1] : 0,
        lat: userLocation ? userLocation[0] : 0,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Request {tradesperson.name}</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>What do you need done?</label>
            <textarea
              rows={4}
              placeholder="e.g. Kitchen sink is leaking, needs fixing today"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Your address (optional)</label>
            <input
              type="text"
              placeholder="e.g. Kilimani, Nairobi"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-block" disabled={loading}>
            {loading ? "Sending..." : "Send request"}
          </button>
        </form>
      </div>
    </div>
  );
}
