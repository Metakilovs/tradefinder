import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          Trade<span>Finder</span>
        </Link>
        <div className="navbar-links">
          <Link to="/browse">Find a tradesperson</Link>
          {user && user.role === "client" && <Link to="/dashboard">My requests</Link>}
          {user && user.role === "tradesperson" && <Link to="/dashboard">My jobs</Link>}
          {user && user.role === "tradesperson" && <Link to="/profile">Edit profile</Link>}
          {!user && <Link to="/login">Log in</Link>}
          {!user && (
            <Link to="/signup" className="navbar-cta">
              Sign up
            </Link>
          )}
          {user && <button onClick={handleLogout}>Log out</button>}
        </div>
      </div>
    </nav>
  );
}
