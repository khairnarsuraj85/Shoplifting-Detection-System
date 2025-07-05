import React, { useState } from 'react';
import './navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <h1>Shoplifting Detection System</h1>
      </div>

      {/* Navigation Links */}
      <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/services">Services</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/contact">Contact</a></li>
          <li>
            <a href="/login" className="signin-button">Sign In</a>
          </li>
        </ul>
      </div>

      {/* Hamburger Menu Icon */}
      <button className="navbar-toggler" onClick={toggleMenu} aria-label="Toggle navigation">
        ☰
      </button>
    </nav>
  );
}

export default Navbar;
