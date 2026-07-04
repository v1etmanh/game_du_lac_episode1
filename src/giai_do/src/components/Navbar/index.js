import React from "react";
import "./navbar.css";

function Navbar({ navigate, onExit }) {
  return (
    <nav className="escape-nav" aria-label="Main navigation">
      <button className="escape-nav-back" type="button" onClick={() => navigate("office")}>
        Quay về phòng khách
      </button>
      {onExit ? (
        <button className="escape-nav-exit" type="button" onClick={onExit}>
          Quay lại bản đồ
        </button>
      ) : null}
    </nav>
  );
}

export default Navbar;
