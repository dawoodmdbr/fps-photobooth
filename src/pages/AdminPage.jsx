import { useEffect, useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { filenameToRoll } from "../utils/rollParser";

const API = "https://fps-photobooth.onrender.com/";

export default function AdminPage() {
  const { logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");
  const [actionState, setActionState] = useState({});
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const updateInputRefs = useRef({});

  const fetchStudents = async () => {
    setLoadingList(true);
    try {
      const res = await fetch(`${API}/api/students`);
      const items = await res.json();
      const enriched = items.map(({ filename, url }) => ({
        filename,
        url,
        nameNoExt: filename.replace(/\.[^/.]+$/, ""),
        roll: filenameToRoll(filename.replace(/\.[^/.]+$/, "")),
      }));
      setStudents(enriched.sort((a, b) => a.roll.localeCompare(b.roll)));
    } catch (e) {
      console.error(e);
    }
    setLoadingList(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleDelete = async (student) => {
    if (!confirm(`Delete photo for ${student.roll}? This cannot be undone.`)) return;
    setActionState((s) => ({ ...s, [student.filename]: "loading" }));
    try {
      const res = await fetch(`${API}/api/delete/${student.filename}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setStudents((prev) => prev.filter((s) => s.filename !== student.filename));
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
    setActionState((s) => { const n = { ...s }; delete n[student.filename]; return n; });
  };

  const handleUpdate = async (student, file) => {
    if (!file) return;
    setActionState((s) => ({ ...s, [student.filename]: "loading" }));
    try {
      const formData = new FormData();
      // Keep the same base name, use new extension
      const ext = file.name.split(".").pop().toLowerCase();
      const newFile = new File([file], `${student.nameNoExt}.${ext}`, { type: file.type });
      formData.append("photo", newFile);
      const res = await fetch(`${API}/api/update/${student.filename}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Update failed");
      await fetchStudents();
    } catch (e) {
      alert("Update failed: " + e.message);
    }
    setActionState((s) => { const n = { ...s }; delete n[student.filename]; return n; });
  };

  const handleBatchUpload = async () => {
    if (!batchFiles.length) return;
    setBatchUploading(true);
    setBatchResults([]);

    const formData = new FormData();
    batchFiles.forEach((f) => formData.append("photos", f, f.name.toLowerCase()));

    try {
      const res = await fetch(`${API}/api/upload`, { method: "POST", body: formData });
      const results = await res.json();
      setBatchResults(
        results.map((r) => ({
          filename: r.filename,
          roll: filenameToRoll(r.filename.replace(/\.[^/.]+$/, "")),
          status: r.status,
        }))
      );
      await fetchStudents();
    } catch (e) {
      setBatchResults([{ filename: "Upload failed", roll: "", status: "error", msg: e.message }]);
    }
    setBatchUploading(false);
    setBatchFiles([]);
  };

  const filtered = students.filter(
    (s) =>
      s.roll.toLowerCase().includes(search.toLowerCase()) ||
      s.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-root">
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
        <span className="admin-badge">Admin Panel</span>
        <button className="student-header-signout" onClick={logout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </header>

      <main className="admin-main">

        {/* Batch Upload Section */}
        <section className="admin-section">
          <div className="section-header">
            <div className="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
            </div>
            <div>
              <h2 className="section-title">Batch Upload</h2>
              <p className="section-sub">Files must be named like <code>24f3053.jpg</code></p>
            </div>
          </div>

          <div className="batch-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setBatchFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/")));
            }}>
            <input
              type="file"
              multiple
              accept="image/*"
              id="batch-input"
              style={{ display: "none" }}
              onChange={(e) => setBatchFiles(Array.from(e.target.files))}
            />
            <label htmlFor="batch-input" className="batch-label">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--blue-400)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>{batchFiles.length > 0 ? `${batchFiles.length} file(s) selected` : "Click or drag images here"}</span>
            </label>
          </div>

          {batchFiles.length > 0 && (
            <div className="batch-preview-list">
              {batchFiles.map((f) => (
                <div key={f.name} className="batch-preview-item">
                  <span className="batch-file-name">{f.name}</span>
                  <span className="batch-file-roll">→ {filenameToRoll(f.name.replace(/\.[^/.]+$/, "").toLowerCase())}</span>
                </div>
              ))}
            </div>
          )}

          <button
            className="upload-btn"
            onClick={handleBatchUpload}
            disabled={!batchFiles.length || batchUploading}
          >
            {batchUploading ? (
              <><div className="spinner-sm" /> Uploading…</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg> Upload {batchFiles.length || ""} Photo{batchFiles.length !== 1 ? "s" : ""}</>
            )}
          </button>

          {batchResults.length > 0 && (
            <div className="batch-results">
              {batchResults.map((r) => (
                <div key={r.filename} className={`batch-result-item ${r.status}`}>
                  <span>{r.status === "success" ? "✓" : "✗"}</span>
                  <span>{r.filename} ({r.roll})</span>
                  {r.msg && <span className="result-err">{r.msg}</span>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Student List Section */}
        <section className="admin-section">
          <div className="section-header">
            <div className="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h2 className="section-title">Student Photos <span className="count-badge">{students.length}</span></h2>
              <p className="section-sub">Update or delete individual student photos</p>
            </div>
          </div>

          <div className="search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search by roll number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loadingList ? (
            <div className="admin-loading"><div className="spinner" /><span>Loading students…</span></div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">No students found.</div>
          ) : (
            <div className="student-list">
              {filtered.map((student) => (
                <div className="student-row" key={student.filename}>
                  <div className="student-row-thumb">
                    {student.url ? (
                      <img src={student.url} alt={student.roll} className="thumb-img" />
                    ) : (
                      <div className="thumb-placeholder">?</div>
                    )}
                  </div>

                  <div className="student-row-info">
                    <span className="student-row-roll">{student.roll}</span>
                    <span className="student-row-file">{student.filename}</span>
                  </div>

                  <div className="student-row-actions">
                    <div className="update-group">
                      <input
                        type="file"
                        accept="image/*"
                        id={`upd-${student.filename}`}
                        style={{ display: "none" }}
                        ref={(el) => (updateInputRefs.current[student.filename] = el)}
                        onChange={(e) => handleUpdate(student, e.target.files[0])}
                      />
                      <label htmlFor={`upd-${student.filename}`} className="action-btn update-btn">
                        {actionState[student.filename] === "loading" ? (
                          <div className="spinner-sm" />
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        )}
                        Update
                      </label>
                    </div>

                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(student)}
                      disabled={actionState[student.filename] === "loading"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
