import React from 'react'
import './hero.css'
import { useNavigate } from 'react-router-dom'
import hero from '../assets/shoplifting-banner.png'

function Hero() {
  const navigate = useNavigate()

  // Navigate to analytics page
  const handleExploreAnalytics = () => {
    navigate("/analytics")
  }

  const handleViewAlerts = () => {
    navigate("/alert-history") // Optional: replace with your actual route
  }

  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Text content */}
        <div className="hero-text">
          <h1 className="hero-title">Welcome to ShopSecure</h1>
          <p className="hero-subtitle">
            Advanced Security with AI-driven Analytics
          </p>
          <p className="hero-description">
            Revolutionizing retail security with cutting-edge AI tools. Stay
            ahead with real-time monitoring and analytics to prevent theft and
            ensure safety.
          </p>
          <div className="hero-buttons">
            <button className="hero-btn btn-primary" onClick={handleViewAlerts}>
              View Alerts
            </button>
            <button className="hero-btn btn-secondary" onClick={handleExploreAnalytics}>
              Explore Analytics
            </button>
          </div>
        </div>

        {/* Image content */}
        <div className="hero-image">
          <img src={hero} alt="Shoplifting Detection Banner" />
        </div>
      </div>
    </section>
  )
}

export default Hero
