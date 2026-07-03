import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("client");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    trade: "Plumber",
    bio: "",
    hourlyRate: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const user = await signup({ ...form, role });
      navigate(user.role === "tradesperson" ? "/dashboard" : "/browse");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="sub">Join TradeFinder as a client or a tradesperson</p>

        <div className="role-toggle">
          <button
            type="button"
            className={role === "client" ? "active" : ""}
            onClick={() => setRole("client")}
          >
            I need help
          </button>
          <button
            type="button"
            className={role === "tradesperson" ? "active" : ""}
            onClick={() => setRole("tradesperson")}
          >
            I offer a service
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Phone</label>
            <input
              type="tel"
              placeholder="07XXXXXXXX"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
          </div>

          {role === "tradesperson" && (
            <>
              <div className="field">
                <label>Trade</label>
                <select value={form.trade} onChange={(e) => update("trade", e.target.value)}>
                  <option>Plumber</option>
                  <option>Electrician</option>
                  <option>Carpenter</option>
                  <option>Painter</option>
                  <option>Mechanic</option>
                  <option>Mason</option>
                </select>
              </div>
              <div className="field">
                <label>Hourly rate (KSh)</label>
                <input
                  type="number"
                  value={form.hourlyRate}
                  onChange={(e) => update("hourlyRate", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Short bio</label>
                <textarea
                  rows={3}
                  placeholder="e.g. 8 years experience fixing residential plumbing in Nairobi"
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-block" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="switch-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
