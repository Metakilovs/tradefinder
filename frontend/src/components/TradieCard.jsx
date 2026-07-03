import React from "react";

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TradieCard({ tradesperson, active, onClick }) {
  const t = tradesperson;
  return (
    <div className={`trade-card ${active ? "active" : ""}`} onClick={onClick}>
      <div className="avatar">
        {t.photoUrl ? <img src={t.photoUrl} alt={t.name} /> : initials(t.name)}
      </div>
      <div className="trade-card-info">
        <h3>{t.name}</h3>
        <div className="trade-label">{t.trade || "Tradesperson"}</div>
        <div className="rate">KSh {t.hourlyRate || 0}/hr</div>
        <span className={`badge ${t.available ? "badge-available" : "badge-unavailable"}`}>
          {t.available ? "Available now" : "Unavailable"}
        </span>
      </div>
    </div>
  );
}
