import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function VerifyAlert({ onVerify }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const alertId = params.get('alert_id');
  const status = params.get('status');

  useEffect(() => {
    if (alertId && status) {
      onVerify(alertId, status);
    } else {
      navigate('/');
    }
  }, [alertId, status, onVerify, navigate]);

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2>Processing Verification...</h2>
        <div className="spinner"></div>
        <p>Redirecting to alert history</p>
      </div>
    </div>
  );
}

export default VerifyAlert;