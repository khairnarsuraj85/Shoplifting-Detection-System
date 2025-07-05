🚨 **Suspicious Activity Detection System**
A real-time intelligent surveillance system that detects suspicious human behavior (e.g. shoplifting) using computer vision. It uses YOLO for object/keypoint detection and XGBoost for behavior classification. When suspicious activity is detected:

✅ An image and a 75-second video clip (30s before + 45s after) are uploaded to Cloudinary
✅ The owner receives a WhatsApp alert with the image, video, and action links
✅ Alerts are stored and managed in Firebase Firestore
✅ Includes a React frontend for live stream, alert history, and verification

📁 Features
🔴 Real-time video feed processing (via webcam or CCTV)

🎯 Suspicious activity detection using YOLO + XGBoost

☁️ Cloudinary storage for image and video clips

🔔 WhatsApp alerts using Twilio API

📊 Analytics and dashboard via REST API

✅ Owner can confirm or reject alerts via React frontend

🧠 Alarm system triggers if activity is confirmed

🔐 Firebase Firestore integration for alert history & settings

🔧 Tech Stack
Component	Tool/Library
Backend	Flask + OpenCV
Detection	YOLOv8 (Ultralytics) + XGBoost
Storage	Cloudinary (for video + image)
Alerts	Twilio (WhatsApp Messaging)
Database	Firebase Firestore
Frontend	React + Axios + Bootstrap

📦 Project Structure
bash
Copy
Edit
project/
│
├── app.py                    # Flask backend
├── best.pt                  # YOLOv8 model weights
├── model_weights.json       # Trained XGBoost model
├── shoplifting-detection-*.json  # Firebase Admin SDK key
│
├── /client                  # React frontend (optional)
│   ├── src/
│   └── ...
🚀 Getting Started
1. Clone the repository
bash
Copy
Edit
git clone https://github.com/yourusername/shoplifting-detection.git
cd shoplifting-detection
2. Install backend dependencies
bash
Copy
Edit
pip install -r requirements.txt
Requirements (requirements.txt)

txt
Copy
Edit
flask
flask-cors
ultralytics
xgboost
firebase-admin
twilio
cloudinary
opencv-python
pandas
numpy
3. Place required files
best.pt: YOLOv8 trained model (for keypoint detection)

model_weights.json: XGBoost model trained on 34 features (x0–x16, y0–y16)

shoplifting-detection-*.json: Firebase Admin SDK key file

4. Configure Environment Variables
Replace with your actual keys or use .env:

python
Copy
Edit
# In app.py (already provided)
TWILIO_ACCOUNT_SID = 'your_twilio_sid'
TWILIO_AUTH_TOKEN = 'your_twilio_auth_token'
TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155238886'
OWNER_WHATSAPP_NUMBER = 'whatsapp:+91xxxxxxxxxx'

cloudinary.config(
    cloud_name="your_cloud_name",
    api_key="your_api_key",
    api_secret="your_api_secret",
    secure=True
)
▶️ Running the Backend
bash
Copy
Edit
python app.py
The Flask server will run at http://localhost:5050.

To test live stream:
Go to http://localhost:5050/stream

🧪 Test Detection
Use any webcam tool or the React frontend to send a base64 frame via /detect.

When suspicious activity is detected:

Image & 75s clip are uploaded to Cloudinary

Alert is sent via WhatsApp

Data is saved to Firestore

🌐 Frontend (Optional)
The frontend includes:

Live CCTV feed

Alert History and Analytics

Alert Verification (Confirm / False Alarm)

Alarm toggle

➡️ [Ask me if you want the full React code too]

📷 Alert Format (WhatsApp)
mathematica
Copy
Edit
🚨 Suspicious activity detected!
🆔 Alert ID: <UUID>
📸 Image: <Cloudinary URL>
🎥 Video: <Cloudinary Video>

✅ Confirm: http://localhost:5173/verify-alert?alert_id=...&status=confirm
❌ False Alarm: http://localhost:5173/verify-alert?alert_id=...&status=false
