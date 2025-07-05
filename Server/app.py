import os
import cv2
import uuid
import base64
import time
import tempfile
import numpy as np
import pandas as pd
from datetime import datetime
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from ultralytics import YOLO
import xgboost as xgb
import firebase_admin
from firebase_admin import credentials, firestore
from twilio.rest import Client
import cloudinary
import cloudinary.uploader
import threading
import logging

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ShopliftingDetection")

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# Load environment variables
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', '')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY', 'your_api_key')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET', 'your_api_secret')
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', 'your_twilio_sid')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', 'your_twilio_token')
TWILIO_WHATSAPP_NUMBER = os.getenv('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')
OWNER_WHATSAPP_NUMBER = os.getenv('OWNER_WHATSAPP_NUMBER', 'whatsapp:+1234567890')

# Firebase initialization
try:
    cred = credentials.Certificate("shoplifting-detection-898ce-firebase-adminsdk-fbsvc-90f7e531f8.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    logger.info("Firebase initialized successfully")
except Exception as e:
    logger.error(f"Firebase initialization failed: {str(e)}")
    raise

# Cloudinary configuration
try:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True
    )
    logger.info("Cloudinary configured successfully")
except Exception as e:
    logger.error(f"Cloudinary configuration failed: {str(e)}")
    raise

# Load models
try:
    model_yolo = YOLO("best.pt")
    model_xgb = xgb.Booster()
    model_xgb.load_model("model_weights.json")
    logger.info("Models loaded successfully")
except Exception as e:
    logger.error(f"Model loading failed: {str(e)}")
    raise

# State management
class SystemState:
    def __init__(self):
        self.alarm_active = False
        self.suspicious_detected = False
        self.current_alert_id = None
        self.frame_buffer = []
        self.lock = threading.Lock()
        self.FPS = 20
        self.BUFFER_MAX_SEC = 75  # 1.25 minutes buffer
        
    def add_frame(self, frame):
        with self.lock:
            ts = time.time()
            self.frame_buffer.append((ts, frame.copy()))
            # Remove frames older than buffer max
            cutoff = ts - self.BUFFER_MAX_SEC
            self.frame_buffer = [(t, f) for t, f in self.frame_buffer if t >= cutoff]
    
    def get_frames(self, duration=30):
        with self.lock:
            if not self.frame_buffer:
                return []
            
            current_time = time.time()
            start_time = current_time - duration
            return [f for t, f in self.frame_buffer if t >= start_time]

system_state = SystemState()

# Send WhatsApp alert
def send_whatsapp_alert(img_url, clip_url, alert_id):
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        body = (
            f"🚨 *Suspicious activity detected!*\n"
            f"🆔 Alert ID: {alert_id}\n"
            f"📸 Image: {img_url}\n"
            f"🎥 Video: {clip_url}\n\n"
            f"✅ Confirm: http://localhost:5173/verify-alert?alert_id={alert_id}&status=confirm\n"
            f"❌ False Alarm: http://localhost:5173/verify-alert?alert_id={alert_id}&status=false"
        )
        message = client.messages.create(
            body=body,
            from_=TWILIO_WHATSAPP_NUMBER,
            to=OWNER_WHATSAPP_NUMBER
        )
        logger.info(f"WhatsApp alert sent: {message.sid}")
        return True
    except Exception as e:
        logger.error(f"WhatsApp send error: {str(e)}")
        return False

# Process Frame
def process_frame(frame):
    results = model_yolo(frame)
    annotated = results[0].plot()
    suspicious_detected = False
    detections = []

    for r in results:
        boxes = r.boxes.xyxy.cpu().numpy()
        confs = r.boxes.conf.cpu().numpy()
        keypoints = r.keypoints.xyn.cpu().numpy() if r.keypoints else []

        for i, box in enumerate(boxes):
            if confs[i] > 0.75:
                data = {}
                if len(keypoints) > i:
                    for j in range(min(17, len(keypoints[i]))):
                        data[f'x{j}'] = keypoints[i][j][0]
                        data[f'y{j}'] = keypoints[i][j][1]

                if len(data) == 34:
                    df = pd.DataFrame([data])
                    pred = model_xgb.predict(xgb.DMatrix(df))[0]
                    label = "Suspicious" if pred < 0.5 else "Normal"
                    if label == "Normal":
                        suspicious_detected = True
                else:
                    label = "Unknown"

                detections.append({
                    "label": label,
                    "confidence": float(confs[i]),
                    "box": list(map(int, box))
                })

    return annotated, detections, suspicious_detected

# Live stream route
@app.route('/stream')
def stream():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        logger.error("Failed to open camera")
        return Response("Camera not available", status=500)
    
    def generate():
        while True:
            ret, frame = cap.read()
            if not ret:
                logger.warning("Failed to capture frame from camera")
                break
            system_state.add_frame(frame)
            _, jpeg = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n')
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Detect route
@app.route('/detect', methods=['POST'])
def detect():
    global system_state
    
    try:
        data = request.json
        if 'frame' not in data:
            return jsonify({"error": "Missing frame data"}), 400
            
        # Extract image data
        img_data = data['frame'].split(',')[1] if ',' in data['frame'] else data['frame']
        img_bytes = base64.b64decode(img_data)
        frame = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
        
        # Process frame
        annotated, detections, suspicious_detected = process_frame(frame)
        system_state.suspicious_detected = suspicious_detected
        
        # Handle suspicious activity
        alert_id = None
        if (suspicious_detected and 
            not system_state.alarm_active and 
            system_state.current_alert_id is None):
            
            system_state.current_alert_id = str(uuid.uuid4())
            timestamp = time.time()
            
            # Get frames from buffer
            frames_to_include = system_state.get_frames(duration=30)
            if not frames_to_include:
                logger.warning("No frames available in buffer")
                return jsonify({"error": "No buffered frames available"}), 400
                
            h, w, _ = frames_to_include[0].shape
            
            # Create temporary video file
            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
                tmp_path = tmp.name
                
            try:
                # Create video writer
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                writer = cv2.VideoWriter(tmp_path, fourcc, system_state.FPS, (w, h))
                
                # Write frames to video
                for frame in frames_to_include:
                    writer.write(frame)
                writer.release()
                
                # Upload image to Cloudinary
                _, img_encoded = cv2.imencode('.jpg', frame)
                img_result = cloudinary.uploader.upload(
                    img_encoded.tobytes(), 
                    resource_type="image", 
                    folder="alerts",
                    public_id=f"alert_{system_state.current_alert_id}_img"
                )
                img_url = img_result["secure_url"]
                
                # Upload video to Cloudinary
                video_result = cloudinary.uploader.upload(
                    tmp_path,
                    resource_type="video",
                    folder="alerts",
                    public_id=f"alert_{system_state.current_alert_id}_vid"
                )
                video_url = video_result["secure_url"]
                
                # Save to Firestore
                alert_data = {
                    "id": system_state.current_alert_id,
                    "timestamp": datetime.utcnow().isoformat(),
                    "image_url": img_url,
                    "video_url": video_url,
                    "status": "pending",
                    "verified": False
                }
                db.collection("alerts").document(system_state.current_alert_id).set(alert_data)
                
                # Send WhatsApp alert
                send_whatsapp_alert(img_url, video_url, system_state.current_alert_id)
                
                logger.info(f"Alert created: {system_state.current_alert_id}")
                
            except Exception as e:
                logger.error(f"Alert creation failed: {str(e)}")
                system_state.current_alert_id = None
                return jsonify({"error": "Alert processing failed"}), 500
                
            finally:
                # Clean up temporary file
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
        
        # Prepare response
        _, buf = cv2.imencode('.jpg', annotated)
        return jsonify({
            "detections": detections,
            "annotated_frame": f"data:image/jpeg;base64,{base64.b64encode(buf).decode()}",
            "alert_id": system_state.current_alert_id,
            "alarm_active": system_state.alarm_active
        })
        
    except Exception as e:
        logger.error(f"Detection error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# Verify alert
@app.route('/verify-alert', methods=['POST'])
def verify_alert():
    try:
        data = request.json
        if "alert_id" not in data or "status" not in data:
            return jsonify({"error": "Missing required parameters"}), 400
            
        alert_id = data["alert_id"]
        status = data["status"]
        
        # Update Firestore
        db.collection("alerts").document(alert_id).update({
            "status": "confirmed" if status == "confirm" else "false",
            "verified": True
        })
        
        # Update system state
        if status == "confirm":
            system_state.alarm_active = True
        else:
            system_state.current_alert_id = None
            
        return jsonify({
            "success": True, 
            "alarm_active": system_state.alarm_active
        })
        
    except Exception as e:
        logger.error(f"Verify alert error: {str(e)}")
        return jsonify({"error": "Failed to verify alert"}), 500

# Stop alarm
@app.route('/alarm/stop', methods=['POST'])
def stop_alarm():
    system_state.alarm_active = False
    system_state.current_alert_id = None
    return jsonify({"success": True})

# Settings
@app.route('/settings', methods=['GET', 'POST'])
def settings():
    try:
        if request.method == 'GET':
            doc = db.collection("config").document("settings").get()
            return jsonify(doc.to_dict() if doc.exists else {})
        else:
            settings_data = request.json
            db.collection("config").document("settings").set(settings_data)
            return jsonify({"message": "Settings saved"})
    except Exception as e:
        logger.error(f"Settings error: {str(e)}")
        return jsonify({"error": "Failed to process settings"}), 500

# Analytics
@app.route('/analytics', methods=['GET'])
def analytics():
    try:
        # Get real data from Firestore
        alerts_ref = db.collection("alerts")
        now = datetime.utcnow()
        one_day_ago = now - pd.DateOffset(hours=24)
        
        # Query alerts from last 24 hours
        query = alerts_ref.where("timestamp", ">=", one_day_ago.isoformat())
        docs = query.stream()
        
        # Group by hour
        hourly_counts = {h: 0 for h in range(24)}
        for doc in docs:
            try:
                alert_time = datetime.fromisoformat(doc.get("timestamp"))
                hour = alert_time.hour
                hourly_counts[hour] += 1
            except:
                continue
        
        # Prepare chart data
        labels = [f"{h}:00" for h in range(24)]
        data = [hourly_counts[h] for h in range(24)]
        
        return jsonify({
            "labels": labels,
            "datasets": [{
                "label": "Suspicious Activities",
                "data": data,
                "borderColor": "rgb(255,99,132)",
                "backgroundColor": "rgba(255,99,132,0.5)"
            }]
        })
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        return jsonify({
            "labels": [],
            "datasets": []
        })

# Dashboard stats
@app.route('/dashboard-stats', methods=['GET'])
def dashboard_stats():
    try:
        # Pending alerts count
        alerts_query = db.collection("alerts").where("status", "==", "pending")
        pending_count = sum(1 for _ in alerts_query.stream())
        
        # System status
        return jsonify({
            "active_alerts": pending_count,
            "is_camera_active": True,  # TODO: Implement actual check
            "detection_accuracy": 96.5,
            "response_time": 1.2,
            "cameras_online": 1,
            "threat_level": "High" if pending_count > 0 else "Low"
        })
    except Exception as e:
        logger.error(f"Dashboard stats error: {str(e)}")
        return jsonify({
            "active_alerts": 0,
            "is_camera_active": False,
            "detection_accuracy": 0,
            "response_time": 0,
            "cameras_online": 0,
            "threat_level": "Unknown"
        })

# Alert history
@app.route('/alert-history', methods=['GET'])
def alert_history():
    try:
        limit = int(request.args.get('limit', 10))
        docs = db.collection("alerts").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit).stream()
        
        alerts = []
        for doc in docs:
            alert_data = doc.to_dict()
            try:
                # Convert Firestore timestamp to string
                if isinstance(alert_data["timestamp"], datetime):
                    alert_data["timestamp"] = alert_data["timestamp"].isoformat()
                elif isinstance(alert_data["timestamp"], str):
                    # Already in ISO format
                    pass
                else:
                    # Handle other cases
                    alert_data["timestamp"] = datetime.utcnow().isoformat()
            except KeyError:
                alert_data["timestamp"] = datetime.utcnow().isoformat()
                
            alerts.append(alert_data)
            
        return jsonify({"alerts": alerts})
    except Exception as e:
        logger.error(f"Alert history error: {str(e)}")
        return jsonify({"alerts": []})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "models_loaded": model_yolo is not None and model_xgb is not None,
        "firebase_initialized": db is not None,
        "cloudinary_configured": cloudinary.config().cloud_name is not None
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="0.0.0.0", port=port, threaded=True)