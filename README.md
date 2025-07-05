
# 🚨 Suspicious Activity Detection System

A real-time intelligent surveillance system that detects suspicious human behavior using computer vision. Built with **YOLO**, **XGBoost**, **Flask**, **Cloudinary**, **Twilio**, and **Firebase**.

---

## 📌 Features

- 🧠 Suspicious activity detection using YOLOv8 + XGBoost
- 🔴 Live video feed processing
- ☁️ Cloudinary storage for images & video clips
- 🔔 WhatsApp alerts with image + 75s video
- ✅ Alert confirmation system with alarm support
- 🔎 Owner dashboard, history, and analytics (React frontend)
- 🔐 Firebase Firestore for persistent alert logs

---

## 📂 Project Structure

```
shoplifting-detection/
│
├── app.py                    # Flask backend
├── best.pt                  # YOLO model
├── model_weights.json       # XGBoost model
├── shoplifting-*.json       # Firebase Admin SDK key
├── requirements.txt
├── README.md
└── /client                  # (Optional) React frontend
```

---

## 🔧 Technologies

| Area         | Stack                         |
|--------------|-------------------------------|
| Backend      | Flask, OpenCV, NumPy, Pandas  |
| Detection    | YOLOv8 (Ultralytics), XGBoost |
| Storage      | Cloudinary                    |
| Alerts       | Twilio WhatsApp API           |
| Database     | Firebase Firestore            |
| Frontend     | React, Axios, Chart.js        |

---

## 🚀 Setup Instructions

### ✅ 1. Clone the project

```bash
git clone https://github.com/your-username/shoplifting-detection.git
cd shoplifting-detection
```

### ✅ 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

**requirements.txt**:

```
flask
flask-cors
ultralytics
xgboost
firebase-admin
twilio
cloudinary
opencv-python
numpy
pandas
```

---

### ✅ 3. Add Required Files

- `best.pt` - YOLOv8 model weights
- `model_weights.json` - Trained XGBoost model (expects features x0–x16 and y0–y16)
- `shoplifting-detection-*.json` - Firebase Admin SDK key (download from Firebase)

---

### ✅ 4. Configure Environment (in `app.py` or `.env`)

Replace or set the following values:

```python
cloudinary.config(
  cloud_name="your_cloud_name",
  api_key="your_api_key",
  api_secret="your_api_secret",
  secure=True
)

TWILIO_ACCOUNT_SID = "your_twilio_sid"
TWILIO_AUTH_TOKEN = "your_twilio_auth"
TWILIO_WHATSAPP_NUMBER = "whatsapp:+14155238886"
OWNER_WHATSAPP_NUMBER = "whatsapp:+91xxxxxxxxxx"
```

---

## ▶️ Run the Flask Backend

```bash
python app.py
```

Access stream at: `http://localhost:5050/stream`  
Backend APIs at: `http://localhost:5050`

---

## 🔗 WhatsApp Alert Structure

A sample WhatsApp alert looks like:

```
🚨 Suspicious activity detected!
🆔 Alert ID: <UUID>
📸 Image: <Cloudinary URL>
🎥 Video: <Cloudinary Video>

✅ Confirm: http://localhost:5173/verify-alert?alert_id=...&status=confirm
❌ False Alarm: http://localhost:5173/verify-alert?alert_id=...&status=false
```

---

## 📊 API Endpoints

| Route                     | Method | Description                         |
|--------------------------|--------|-------------------------------------|
| `/stream`                | GET    | Live webcam stream                  |
| `/detect`                | POST   | Process image, detect suspicious    |
| `/verify-alert`          | POST   | Confirm or reject an alert          |
| `/alarm/stop`            | POST   | Stop the currently triggered alarm  |
| `/settings`              | GET/POST | Retrieve or update config         |
| `/analytics`             | GET    | Get chart data for dashboard        |
| `/dashboard-stats`       | GET    | Get dashboard statistics            |
| `/alert-history`         | GET    | Get last 10 alerts from Firestore   |

---

## 🧪 Test Manually

To test:
- Send POST to `/detect` with a base64-encoded frame (as `data:image/jpeg;base64,...`)
- On suspicious detection:
  - Image + 75-second video is uploaded to Cloudinary
  - Alert sent to WhatsApp
  - Firestore entry created

---

## 🌐 Frontend (Optional)

A React-based frontend provides:
- Live feed view
- Alert verification panel
- Alert history with thumbnails
- Real-time analytics

➡️ Let us know if you want full React code and integration guide.

---

## 🛡️ Security Notes

- Do not expose your Twilio or Firebase keys in production
- Use `.env` or encrypted secrets for deployment
- Ensure backend runs with HTTPS for secure data transmission

---

## 🙋 Author

**Suraj Khairnar**  
This system was developed for intelligent retail security surveillance.

---

## 📃 License

This project is licensed for educational and non-commercial use only.
