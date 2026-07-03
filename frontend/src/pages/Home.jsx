import React from "react";
import { useNavigate } from "react-router-dom";
import MapView from "../components/MapView.jsx";
import useGeolocation from "../useGeolocation.js";

export default function Home() {
  const navigate = useNavigate();
  const { position } = useGeolocation();

  function handleSubmit(e) {
    e.preventDefault();
    navigate("/browse");
  }

  return (
    <div className="hero">
      <div className="hero-inner">
        <div>
          <h1>Skilled help, nearby, in minutes.</h1>
          <p className="lead">
            TradeFinder connects you with verified plumbers, electricians, carpenters and more —
            matched by who's actually closest to you right now.
          </p>
          <form className="hero-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>What do you need?</label>
              <select defaultValue="">
                <option value="" disabled>
                  Choose a trade
                </option>
                <option>Plumber</option>
                <option>Electrician</option>
                <option>Carpenter</option>
                <option>Painter</option>
                <option>Mechanic</option>
                <option>Mason</option>
              </select>
            </div>
            <button type="submit" className="btn" style={{ background: "white", color: "black" }}>
              Find tradespeople near me
            </button>
          </form>
        </div>
        <div className="hero-map-frame">
          <MapView center={position} tradespeople={[]} />
        </div>
      </div>
    </div>
  );
}
