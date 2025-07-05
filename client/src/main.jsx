import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppContextProvider from './context/AppContext.jsx';
import { FirebaseProvider } from './context/FirebaseContext';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        {/* Firebase context wraps the app to provide auth/db functionality */}
        <FirebaseProvider>
          <App />
        </FirebaseProvider>
      </AppContextProvider>
    </BrowserRouter>
  </StrictMode>
);
