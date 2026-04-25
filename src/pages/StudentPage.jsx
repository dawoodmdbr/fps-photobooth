import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { rollToFilename } from "../utils/rollParser";

const API = "https://fps-photobooth.onrender.com";

async function findImageData(rollNumber) {
  const filename = rollToFilename(rollNumber);
  const res = await fetch(`${API}/api/photo/${filename}`);
  if (!res.ok) return null;
  return await res.json(); // { url, filename }
}

export default function StudentPage() {
  const { user, logout } = useAuth();
  const [imageData, setImageData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | found | notfound | error

  useEffect(() => {
    if (!user?.rollNumber) return;
    setStatus("loading");

    findImageData(user.rollNumber)
      .then((data) => {
        if (data) {
          setImageData(data);
          setStatus("found");
        } else {
          setStatus("notfound");
        }
      })
      .catch(() => setStatus("error"));
  }, [user?.rollNumber]);

  const handleDownload = async () => {
    if (!imageData) return;
    try {
      const response = await fetch(imageData.url);
      const blob = await response.blob();
      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobURL;
      a.download = imageData.filename;
      a.click();
      URL.revokeObjectURL(blobURL);
    } catch {
      alert("Download failed. Please try again.");
    }
  };

  return (
    <div className="student-root">
      {/* Header */}
      <header className="student-header">
        <div className="student-header-logo">
          <div className="header-logo-placeholder">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="10" fill="var(--blue-500)" />
              <circle cx="24" cy="24" r="10" stroke="white" strokeWidth="2.5" />
              <circle cx="24" cy="24" r="5" fill="white" />
              <rect x="10" y="13" width="8" height="5" rx="2" fill="white" opacity="0.6" />
            </svg>
          </div>
          <span className="header-logo-text">FPS Photobooth</span>
        </div>

        <div className="student-header-roll">
          <span className="roll-badge">{user?.rollNumber}</span>
        </div>

        <button className="student-header-signout" onClick={logout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </header>

      {/* Main content */}
      <main className="student-main">
        {status === "loading" && (
          <div className="student-state">
            <div className="spinner" />
            <p className="state-text">Fetching your photo…</p>
          </div>
        )}

        {status === "notfound" && (
          <div className="student-state">
            <div className="state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--blue-400)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <h2 className="state-title">Photo Not Found</h2>
            <p className="state-text">Your photo hasn't been uploaded yet. Please contact the FPS admin.</p>
          </div>
        )}

        {status === "error" && (
          <div className="student-state">
            <div className="state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--blue-400)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="state-title">Something went wrong</h2>
            <p className="state-text">Unable to load your photo. Please refresh or try again later.</p>
          </div>
        )}

        {status === "found" && imageData && (
          <div className="photo-card">
            <div className="photo-frame">
              <img
                src={imageData.url}
                alt={`Official photo of ${user.rollNumber}`}
                className="photo-img"
              />
              <div className="photo-overlay">
                <span className="photo-overlay-text">Official University Photo</span>
              </div>
            </div>

            <div className="photo-info">
              <div className="photo-info-row">
                <span className="photo-label">Roll Number</span>
                <span className="photo-value">{user.rollNumber}</span>
              </div>
              <div className="photo-info-row">
                <span className="photo-label">Institution</span>
                <span className="photo-value">FAST-NUCES, Faisalabad</span>
              </div>
              <div className="photo-info-row">
                <span className="photo-label">Photo Type</span>
                <span className="photo-value">Official · High Resolution</span>
              </div>
            </div>

            <button className="download-btn" onClick={handleDownload}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Photo
            </button>

            <p className="download-hint">High-quality photo suitable for LinkedIn, CV, and official documents.</p>
          </div>
        )}
      </main>
    </div>
  );
}
