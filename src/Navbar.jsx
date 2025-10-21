// src/Navbar.jsx
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "linear-gradient(90deg, #0b0f1a, #11182a, #0f1525)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
      }}
    >
      <div
        className="wrap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px"
        }}
      >
        {/* Left: Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/Logo.png" alt="Logo" style={{ height: "40px" }} />
          <span style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "0.5px" }}>
            Blockchain Document Storage
          </span>
        </div>

        {/* Right: Nav links */}
        <div style={{ display: "flex", gap: "18px" }}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              padding: "8px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "600",
              color: isActive ? "#fff" : "#cbd5e1",
              background: isActive ? "rgba(124,58,237,0.25)" : "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: "0.2s"
            })}
          >
            Home
          </NavLink>

          <NavLink
            to="/help"
            style={({ isActive }) => ({
              padding: "8px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "600",
              color: isActive ? "#fff" : "#cbd5e1",
              background: isActive ? "rgba(124,58,237,0.25)" : "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: "0.2s"
            })}
          >
            How it works
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
