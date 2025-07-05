import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useFirebase } from './context/FirebaseContext'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Hero from './components/Hero'
import MainPage from './components/MainPage'
import About from './components/About'
import Contact from './components/Contact'
import Analytics from './components/Analytics'
import AlertHistory from './components/AlertHistory'
import Settings from './components/Settings'
import Alerts from './components/Alerts'
import VerifyAlert from './components/VerifyAlert'

function App() {
  const [alertHistory, setAlertHistory] = useState([]);
  const { alarmActive, setAlarmActive } = useFirebase();
  const navigate = useNavigate();

  // Play alarm sound when activated
  useEffect(() => {
    if (alarmActive) {
      const alarmSound = new Audio('/alarm.mp3');
      alarmSound.loop = true;
      alarmSound.play();
      
      return () => alarmSound.pause();
    }
  }, [alarmActive]);

  const addAlertToHistory = (message, time) => {
    setAlertHistory(prev => [...prev, { message, time }]);
  };

  const verifyAlertHandler = (alertId, status) => {
    fetch('http://localhost:5050/verify-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert_id: alertId, status })
    })
    .then(response => response.json())
    .then(data => {
      if (data.alarm_active) {
        setAlarmActive(true);
      }
      navigate('/alert-history');
    });
  };

  return (
    <div className="app-container">
      <Navbar />
      {alarmActive && (
        <div className="alarm-banner">
          <div className="alarm-content">
            <span className="alarm-icon">🚨</span>
            <h3>SECURITY ALARM ACTIVATED!</h3>
            <button 
              className="alarm-stop-btn"
              onClick={() => {
                fetch('http://localhost:5050/alarm/stop', { method: 'POST' })
                .then(() => setAlarmActive(false))
              }}
            >
              STOP ALARM
            </button>
          </div>
        </div>
      )}
      
      <Routes>
        <Route path='/' element={
          <>
            <Hero />
            <MainPage addAlertToHistory={addAlertToHistory} />
          </>
        } />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/analytics' element={<Analytics />} />
        <Route path='/alert-history' element={
          <AlertHistory 
            alertHistory={alertHistory} 
          />} 
        />
        <Route path='/alerts' element={
          <Alerts 
            addAlertToHistory={addAlertToHistory} 
          />} 
        />
        <Route path='/settings' element={<Settings />} />
        <Route path='/verify-alert' element={
          <VerifyAlert onVerify={verifyAlertHandler} />
        } />
      </Routes>
      <Footer />
    </div>
  )
}

export default App