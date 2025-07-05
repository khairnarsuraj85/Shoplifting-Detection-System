import { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

// Create context
const FirebaseContext = createContext();

// Firebase config (replace with actual keys)
const firebaseConfig = {
  apiKey: "Enter Api",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export const FirebaseProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [alarmActive, setAlarmActive] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "alerts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        let timestamp = data.timestamp;
        try {
          timestamp = new Date(data.timestamp).toLocaleString();
        } catch (err) {
          console.error("Invalid timestamp:", data.timestamp);
        }

        return {
          ...data,
          id: doc.id,
          timestamp
        };
      });

      setAlerts(alertsData);
    });

    return () => unsubscribe();
  }, []);

  const uploadVideo = async (file) => {
    try {
      const storageRef = ref(storage, `videos/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Video upload failed:", error);
      return null;
    }
  };

  return (
    <FirebaseContext.Provider value={{ alerts, alarmActive, setAlarmActive, uploadVideo }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Hook to use Firebase context
export const useFirebase = () => useContext(FirebaseContext);
