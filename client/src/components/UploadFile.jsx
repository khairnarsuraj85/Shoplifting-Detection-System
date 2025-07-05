import React, { useState, useRef } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import './UploadFile.css';

export default function UploadFile() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { uploadVideo } = useFirebase();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Validate file type and size
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid video file (MP4, MOV, AVI)');
      return;
    }
    
    if (selectedFile.size > 1024 * 1024 * 1024) { // 1GB
      setError('File size exceeds 1GB limit');
      return;
    }
    
    setError('');
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setProgress(0);
    
    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      const url = await uploadVideo(file);
      
      clearInterval(interval);
      setProgress(100);
      setVideoUrl(url);
    } catch (err) {
      setError('Upload failed - ' + err.message);
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setVideoUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h2>Upload CCTV Footage</h2>
        <p>Store security footage for analysis and evidence</p>
      </div>

      <div className="upload-card">
        <form onSubmit={handleSubmit} className="upload-form">
          <div 
            className={`file-drop-area ${file ? 'has-file' : ''} ${error ? 'has-error' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              hidden
            />

            <div className="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M11 16V7.85l-2.6 2.6L7 9l5-5 5 5-1.4 1.45-2.6-2.6V16h-2Zm-6 4q-.825 0-1.412-.587Q3 18.825 3 18v-3h2v3h14v-3h2v3q0 .825-.587 1.413Q19.825 20 19 20Z"/>
              </svg>
            </div>
            
            <div className="upload-instructions">
              {file ? (
                <>
                  <div className="file-info">
                    <strong>{file.name}</strong>
                    <span>{(file.size/(1024*1024)).toFixed(2)} MB</span>
                  </div>
                </>
              ) : (
                <>
                  <p>Drag & drop a video file here</p>
                  <p>or <span>Browse Files</span></p>
                  <small>Supported formats: MP4, MOV, AVI (max 1GB)</small>
                </>
              )}
            </div>
          </div>

          {error && <div className="upload-error">{error}</div>}

          {uploading && (
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              <div className="progress-text">{progress}%</div>
            </div>
          )}

          <div className="action-buttons">
            <button
              type="button"
              className="secondary-btn"
              onClick={clearSelection}
              disabled={uploading}
            >
              Clear
            </button>
            <button
              type="submit"
              className="primary-btn"
              disabled={uploading || !file}
            >
              {uploading ? (
                <>
                  <span className="spinner"></span>
                  Uploading...
                </>
              ) : (
                'Upload Video'
              )}
            </button>
          </div>
        </form>

        {videoUrl && (
          <div className="video-preview">
            <div className="preview-header">
              <h3>Upload Successful!</h3>
              <p>Video is now stored securely</p>
            </div>
            <video src={videoUrl} controls />
            <div className="preview-actions">
              <a
                className="download-link"
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Video
              </a>
              <button className="secondary-btn" onClick={clearSelection}>
                Upload Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}