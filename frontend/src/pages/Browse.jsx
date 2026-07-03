import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext.jsx";
import useGeolocation from "../useGeolocation.js";
import MapView from "../components/MapView.jsx";
import TradieCard from "../components/TradieCard.jsx";
import BookingModal from "../components/BookingModal.jsx";

export default function Browse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { position } = useGeolocation();
  const [tradespeople, setTradespeople] = useState([]);
  const [trade, setTrade] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [bookingTarget, setBookingTarget] = useState(null);
  const [sentMessage, setSentMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(15000); // in meters

  useEffect(() => {
    if (!position) return;
    fetchTradespeople();
  }, [position, trade, radius]);

  async function fetchTradespeople() {
    setLoading(true);
    try {
      const params = { lat: position[0], lng: position[1], maxDistance: radius };
      if (trade) params.trade = trade;
      const { data } = await api.get("/tradespeople", { params });
      setTradespeople(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleRequestClick(t) {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "client") {
      alert("Only client accounts can send booking requests. Log in as a client to continue.");
      return;
    }
    setBookingTarget(t);
  }

  const selected = tradespeople.find((t) => t._id === selectedId);

  return (
    <div className="browse-layout">
      <div className="browse-list">
        <div className="browse-filters">
          <select value={trade} onChange={(e) => setTrade(e.target.value)}>
            <option value="">All trades</option>
            <option>Plumber</option>
            <option>Electrician</option>
            <option>Carpenter</option>
            <option>Painter</option>
            <option>Mechanic</option>
            <option>Mason</option>
          </select>
          <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
            <option value={5000}>5 km</option>
            <option value={10000}>10 km</option>
            <option value={15000}>15 km</option>
            <option value={25000}>25 km</option>
            <option value={50000}>50 km</option>
          </select>
        </div>

        {loading && <div className="empty-state">Finding tradespeople near you...</div>}

        {!loading && tradespeople.length === 0 && (
          <div className="empty-state">
            No tradespeople found nearby yet. Try a different trade or check back soon.
          </div>
        )}

        {!loading &&
          tradespeople.map((t) => (
            <div key={t._id}>
              <TradieCard
                tradesperson={t}
                active={t._id === selectedId}
                onClick={() => setSelectedId(t._id)}
              />
              {t._id === selectedId && (
                <div style={{ padding: "0 16px 16px" }}>
                  {t.bio && <p style={{ marginBottom: 10 }}>{t.bio}</p>}
                  <button className="btn btn-sm btn-block" onClick={() => handleRequestClick(t)}>
                    Request {t.name}
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      <div className="browse-map">
        <MapView
          center={position}
          tradespeople={tradespeople}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {bookingTarget && (
        <BookingModal
          tradesperson={bookingTarget}
          userLocation={position}
          onClose={() => setBookingTarget(null)}
          onSuccess={() => {
            setBookingTarget(null);
            setSentMessage(`Request sent to ${bookingTarget.name}. Check "My requests" for updates.`);
          }}
        />
      )}

      {sentMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "black",
            color: "white",
            padding: "14px 22px",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 600,
          }}
          onClick={() => setSentMessage("")}
        >
          {sentMessage}
        </div>
      )}
    </div>
  );
}
