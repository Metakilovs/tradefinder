import React, { useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext.jsx";
import useGeolocation from "../useGeolocation.js";

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const { position } = useGeolocation();
  const [form, setForm] = useState({
    trade: user?.trade || "Plumber",
    bio: user?.bio || "",
    hourlyRate: user?.hourlyRate || 0,
    available: user?.available ?? true,
    photoUrl: user?.photoUrl || "",
  });
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { data } = await api.put("/tradespeople/me", form);
    setUser(data);
    localStorage.setItem("tf_user", JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function shareLocation() {
    if (!position) return;
    setSharing(true);
    try {
      const { data } = await api.put("/tradespeople/me/location", {
        lat: position[0],
        lng: position[1],
      });
      setUser(data);
      localStorage.setItem("tf_user", JSON.stringify(data));
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="container profile-page" style={{ maxWidth: 520 }}>
      <h1 style={{ marginBottom: 24 }}>Your profile</h1>

      <div className="profile-section" style={{ borderTop: "none" }}>
        <h3>Live location</h3>
        <p style={{ marginBottom: 12 }}>
          Clients only see you on the map once you share your current location. Update it whenever
          you move to a new job site.
        </p>
        <button className="btn" onClick={shareLocation} disabled={!position || sharing}>
          {sharing ? "Sharing..." : "Share my current location"}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="profile-section">
          <h3>Trade</h3>
          <div className="field">
            <select value={form.trade} onChange={(e) => update("trade", e.target.value)}>
              <option>Plumber</option>
              <option>Electrician</option>
              <option>Carpenter</option>
              <option>Painter</option>
              <option>Mechanic</option>
              <option>Mason</option>
            </select>
          </div>
        </div>

        <div className="profile-section">
          <h3>Hourly rate (KSh)</h3>
          <div className="field">
            <input
              type="number"
              value={form.hourlyRate}
              onChange={(e) => update("hourlyRate", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="profile-section">
          <h3>Bio</h3>
          <div className="field">
            <textarea rows={3} value={form.bio} onChange={(e) => update("bio", e.target.value)} />
          </div>
        </div>

        <div className="profile-section">
          <h3>Photo URL</h3>
          <div className="field">
            <input
              type="text"
              placeholder="https://..."
              value={form.photoUrl}
              onChange={(e) => update("photoUrl", e.target.value)}
            />
          </div>
        </div>

        <div className="profile-section">
          <h3>Availability</h3>
          <div className="role-toggle" style={{ maxWidth: 300 }}>
            <button
              type="button"
              className={form.available ? "active" : ""}
              onClick={() => update("available", true)}
            >
              Available
            </button>
            <button
              type="button"
              className={!form.available ? "active" : ""}
              onClick={() => update("available", false)}
            >
              Unavailable
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-block" style={{ marginTop: 20 }}>
          Save profile
        </button>
        {saved && (
          <p style={{ marginTop: 12, fontWeight: 700, textAlign: "center" }}>Profile saved ✓</p>
        )}
      </form>
    </div>
  );
}
