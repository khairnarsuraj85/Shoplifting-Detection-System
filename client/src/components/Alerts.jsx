import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AlertIcon from '../assets/alert-icon.svg'

function Alerts({ addAlertToHistory }) {
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const triggerAlert = () => {
    setLoading(true)
    
    const alertMessages = [
      "Suspicious activity detected! Possible shoplifting in Aisle 3",
      "Alert: Customer left without scanning items at Checkout 2",
      "Warning: Unusual movement detected near electronics section",
      "Critical: Multiple people lingering in high-theft area",
      "Notice: Camera feed temporarily disconnected in Section B",
    ]
    
    const randomAlert = alertMessages[Math.floor(Math.random() * alertMessages.length)]
    
    // Simulate API call delay
    setTimeout(() => {
      setAlert(randomAlert)
      setLoading(false)
      
      const timestamp = new Date().toLocaleTimeString()
      addAlertToHistory(randomAlert, timestamp)
    }, 1000)
  }

  const viewAlertHistory = () => navigate("/alert-history")
  const manageSettings = () => navigate("/settings")

  return (
    <section className="alerts">
      <div className="alerts-header">
        <div className="alert-icon">
          <img src={AlertIcon} alt="Alert" />
        </div>
        <div>
          <h2>Security Alerts</h2>
          <p>Real-time notifications and alert management</p>
        </div>
      </div>

      <div className="alert-simulator">
        <h3>Test Alert System</h3>
        <p>Simulate suspicious activity to test the alert workflow</p>
        
        <button 
          onClick={triggerAlert} 
          className={`alert-button ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Generating Alert...' : 'Simulate Alert'}
        </button>

        {alert && (
          <div className="alert-box">
            <div className="alert-indicator"></div>
            <p>{alert}</p>
          </div>
        )}
      </div>

      <div className="alert-actions">
        <button className="action-btn" onClick={viewAlertHistory}>
          <i className="icon-history"></i>
          <span>View History</span>
        </button>
        
        <button className="action-btn" onClick={() => setAlert(null)}>
          <i className="icon-clear"></i>
          <span>Clear Alert</span>
        </button>
        
        <button className="action-btn" onClick={manageSettings}>
          <i className="icon-settings"></i>
          <span>Alert Settings</span>
        </button>
      </div>
    </section>
  )
}

export default Alerts