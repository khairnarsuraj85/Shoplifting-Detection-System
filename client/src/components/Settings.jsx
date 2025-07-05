import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Settings.css';

function Settings() {
  const [form, setForm] = useState({
    alertsEnabled: true,
    notificationSound: true,
    alertType: 'email',
    sensitivity: 75,
    email: '',
    phone: ''
  });

  const [status, setStatus] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5050/settings')
      .then(res => {
        if (res.data) setForm(prev => ({ ...prev, ...res.data }));
      })
      .catch(() => setStatus('Failed to load settings ❌'));
  }, []);

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5050/settings', form);
      setStatus('✅ Settings saved successfully!');
    } catch {
      setStatus('❌ Failed to save settings');
    }
  };

  return (
    <div className="page-container">
      <section className="settings">
        <h2>Security Settings</h2>

        <form onSubmit={saveSettings}>
          {/* Alerts toggle */}
          <div className="setting-item">
            <label>Enable Alerts</label>
            <input
              type="checkbox"
              checked={form.alertsEnabled}
              onChange={e => setForm({ ...form, alertsEnabled: e.target.checked })}
            />
          </div>

          {/* Sound toggle */}
          <div className="setting-item">
            <label>Play Sound When Alert</label>
            <input
              type="checkbox"
              checked={form.notificationSound}
              onChange={e => setForm({ ...form, notificationSound: e.target.checked })}
            />
          </div>

          {/* Alert Delivery Method */}
          <div className="setting-item">
            <label>Alert Delivery Method:</label>
            <div className="radio-group">
              {['email', 'sms', 'whatsapp', 'all'].map(method => (
                <label key={method}>
                  <input
                    type="radio"
                    name="alertType"
                    value={method}
                    checked={form.alertType === method}
                    onChange={() => setForm({ ...form, alertType: method })}
                  />
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Sensitivity Slider */}
          <div className="setting-item">
            <label>Sensitivity: {form.sensitivity}%</label>
            <input
              type="range"
              min="1"
              max="100"
              value={form.sensitivity}
              onChange={e => setForm({ ...form, sensitivity: parseInt(e.target.value) })}
            />
          </div>

          {/* Email */}
          <div className="setting-item">
            <label>Notification Email:</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="owner@yourstore.com"
              required
            />
          </div>

          {/* Phone */}
          <div className="setting-item">
            <label>Mobile Number:</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 12345 67890"
              required
            />
          </div>

          {/* Buttons */}
          <div className="settings-actions">
            <button type="submit" className="btn-save">Save Changes</button>
            <button type="button" className="btn-cancel" onClick={() => window.location.reload()}>Cancel</button>
          </div>

          {status && <p className="status-msg">{status}</p>}
        </form>
      </section>
    </div>
  );
}

export default Settings;
