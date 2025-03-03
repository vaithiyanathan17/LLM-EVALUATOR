import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h2 className="logo">LLM Evaluation</h2>
      <ul>
        <li><Link to="/upload">Upload Dataset</Link></li>
        <li><Link to="/evaluate">Evaluate Prompts</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
