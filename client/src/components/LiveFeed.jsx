import React, { useState, useRef, useEffect } from "react";
import "./livefeed.css";
import Webcam from "react-webcam";
import axios from "axios";
import { useFirebase } from "../context/FirebaseContext";

function LiveFeed() {
  const [feedActive, setFeedActive] = useState(true);
  const [timestamp, setTimestamp] = useState(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);
  const { alarmActive, setAlarmActive } = useFirebase();

  const toggleFeed = () => {
    setFeedActive(!feedActive);
    setTimestamp(!feedActive ? new Date().toLocaleString() : null);
  };

  const captureFrame = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) handleCapture(imageSrc);
    }
  };

  const handleCapture = async (imageSrc) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5050/detect",
        { frame: imageSrc },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const data = response.data;
      setDetections(data?.detections || []);
      if (data.alarm_active) {
        setAlarmActive(true); // triggers sound from App.jsx
      }
    } catch (error) {
      console.error("Error in sending frame:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;
    if (feedActive) intervalId = setInterval(captureFrame, 2000);
    return () => clearInterval(intervalId);
  }, [feedActive]);

  return (
    <section className="live-feed">
      <div className="video-container">
        {feedActive ? (
          <div className="feed-wrapper">
            <Webcam
              className="video-feed"
              mirrored={true}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
            />
            <div className="feed-status-box">
              <h2 className="live-feed-title">Live Video Monitoring</h2>
              <p className="feed-status">
                <strong>Status:</strong> <span className="live">LIVE</span>
              </p>
            </div>
          </div>
        ) : (
          <p className="feed-status paused">
            <strong>Status:</strong> Feed is <span className="paused">PAUSED</span>. Click "Start Feed" to resume.
          </p>
        )}
      </div>

      <div className="feed-controls">
        <button
          onClick={toggleFeed}
          className={`feed-control-button ${feedActive ? "pause" : "start"}`}
        >
          {feedActive ? "Pause Feed" : "Start Feed"}
        </button>
      </div>

      {!feedActive && timestamp && (
        <p className="timestamp">
          <strong>Paused At:</strong> {timestamp}
        </p>
      )}

      {loading && <p className="loading-text">Processing...</p>}

      {detections.length > 0 && (
        <div className="detections">
          <h3>Detections:</h3>
          {detections.map((detection, index) => (
            <div key={index} className="detection-item">
              <p><strong>Label:</strong> {detection.label}</p>
              <p><strong>Confidence:</strong> {detection.confidence.toFixed(2)}</p>
              <p><strong>Box:</strong> [{detection.box.join(", ")}]</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default LiveFeed;
