import React from 'react';
import LiveFeed from './LiveFeed';
import AlertSection from './AlertSection';
import Dashboard from './Dashboard';
import UploadFile from './UploadFile';
import './MainPage.css';

function MainPage({ addAlertToHistory }) {
  return (
    <div className="main-page">
      {/* Top row: Live feed + alerts */}
      <div className="row-two-columns">
        <div className="left-column">
          <LiveFeed />
        </div>
        <div className="right-column">
          <AlertSection addAlertToHistory={addAlertToHistory} />
        </div>
      </div>

      {/* Full-width components */}
      <div className="row-full">
        <Dashboard />
      </div>
      <div className="row-full">
        <UploadFile />
      </div>
    </div>
  );
}

export default MainPage;
