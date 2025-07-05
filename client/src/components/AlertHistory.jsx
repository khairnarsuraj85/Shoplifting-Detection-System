import React, { useState, useEffect } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import './alertHistory.css';
import { useNavigate } from 'react-router-dom';

function AlertHistory({ alertHistory }) {
  const { alerts } = useFirebase();
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (alerts.length > 0) {
      setLoading(false);
    }
  }, [alerts]);

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter(alert => alert.status === filter);

  const statusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge badge-danger">Confirmed</span>;
      case 'false':
        return <span className="badge badge-safe">False Alarm</span>;
      case 'pending':
        return <span className="badge badge-pending">Pending</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const handleViewDetails = (alertId) => {
    navigate(`/verify-alert?alert_id=${alertId}`);
  };

  const handleWatchVideo = (alertId) => {
    alert(`Watch Video clicked for alert: ${alertId}`);
    // Optional: Implement video fetching from Firebase and play in modal
  };

  return (
    <section className="alert-history">
      <div className="history-header">
        <h2>Alert History</h2>
        <div className="filters">
          {['all', 'confirmed', 'false', 'pending'].map(option => (
            <button
              key={option}
              className={filter === option ? 'active' : ''}
              onClick={() => setFilter(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-alerts">
          <div className="spinner"></div>
          <p>Loading alert history...</p>
        </div>
      ) : (
        <div className="alerts-grid">
          {filteredAlerts.length === 0 ? (
            <div className="no-alerts">
              <div className="no-alerts-icon">📋</div>
              <h3>No alerts found</h3>
              <p>No security alerts match your current filter</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className="alert-card">
                <div className="alert-image">
                  <img src={alert.image_url} alt="Alert capture" />
                  <div className="alert-status">{statusBadge(alert.status)}</div>
                </div>
                <div className="alert-details">
                  <div className="alert-time">{alert.timestamp}</div>
                  <div className="alert-actions">
                    <button className="btn-view" onClick={() => handleViewDetails(alert.id)}>
                      <i className="icon-eye"></i> View Details
                    </button>
                    {alert.status === 'confirmed' && (
                      <button className="btn-video" onClick={() => handleWatchVideo(alert.id)}>
                        <i className="icon-play"></i> Watch Video
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="test-alerts">
        <h3>Test Alert History (Temporary Data)</h3>
        <ul>
          {alertHistory.map((alert, index) => (
            <li key={index}>
              <span className="alert-time">{alert.time}</span>
              <span className="alert-message">{alert.message}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default AlertHistory;
