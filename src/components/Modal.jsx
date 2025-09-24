import "../modal.css";
export const Modal = ({
  type,
  message,
  onConfirm,
  onCancel,
  pasteText,
  setPasteText,
}) => {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle} className="modal-enter">
        {/* Paste Modal */}
        {type === "paste" && (
          <>
            <h3>{message}</h3>
            <textarea
              style={{ width: "100%", height: "120px", marginTop: "10px" }}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
            <div style={{ marginTop: "10px", textAlign: "right" }}>
              <button onClick={onConfirm} style={okButtonStyle}>
                ✅ OK
              </button>
              <button onClick={onCancel} style={cancelButtonStyle}>
                ❌ Cancel
              </button>
            </div>
          </>
        )}

        {/* Confirm Modal */}
        {type === "confirm" && (
          <>
            <p>{message}</p>
            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              <button onClick={onConfirm} style={okButtonStyle}>
                ✅ Yes
              </button>
              <button onClick={onCancel} style={cancelButtonStyle}>
                ❌ No
              </button>
            </div>
          </>
        )}

        {/* About Modal */}
        {type === "info" && (
          <div style={aboutModalStyle}>
            <span
              style={{
                position: "absolute",
                top: 18,
                right: 28,
                fontSize: 28,
                color: "#888",
                cursor: "pointer",
                fontWeight: "bold",
                zIndex: 10,
              }}
              onClick={onCancel}
              title="Close"
            >
              ×
            </span>
            <img
              src="/vite.svg"
              alt="App Logo"
              style={{ width: 60, marginBottom: 12 }}
            />
            <h2 style={{ color: "#1976d2", marginBottom: 8 }}>
              About GC Balance Checker
            </h2>
            <p style={{ fontSize: 15, marginBottom: 8 }}>
              <b>GC Balance Checker</b> is a modern tool for analyzing Gas
              Chromatography (GC) data.
              <br />
              <span style={{ color: "#1976d2" }}>Features include:</span>
            </p>
            <ul
              style={{
                textAlign: "left",
                margin: "0 auto 12px",
                maxWidth: 340,
                fontSize: 15,
              }}
            >
              <li>📋 Paste or import data directly into the app.</li>
              <li>
                ✅ Normalize gas components against TotalGas for accuracy.
              </li>
              <li>⚠️ Get instant alerts if TotalGas exceeds safe limits.</li>
              <li>� Visualize and review your data in a clear table.</li>
              <li>
                �📤 Export your results as CSV for reporting or further
                analysis.
              </li>
              <li>
                🔒 All processing is local—your data never leaves your device.
              </li>
            </ul>
            <div
              style={{
                fontSize: 14,
                marginBottom: 8,
                textAlign: "left",
                maxWidth: 340,
              }}
            >
              <b>Version:</b> 1.0.0
              <br />
              <b>Author:</b> Imonisa Oghenekevwe Brian
              <br />
              <b>Contact:</b>{" "}
              <a
                href="mailto:mcrbiandavids43@gmail.com"
                style={{ color: "#1976d2" }}
              >
                mcrbiandavids43@gmail.com
              </a>
              <br />
              <b>License:</b> MIT
            </div>
            <div style={{ marginBottom: 12 }}>
              <a
                href="https://github.com/mcbriandavids/GC-checker"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#1976d2",
                  textDecoration: "underline",
                  fontWeight: "bold",
                }}
              >
                GitHub Repository
              </a>
            </div>
            <button
              onClick={onCancel}
              style={{
                ...okButtonStyle,
                width: 120,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const aboutModalStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: 0,
  position: "relative",
};

// 🎨 Styles
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "white",
  padding: 24,
  borderRadius: 8,
  textAlign: "center",
  width: 400,
};

const okButtonStyle = {
  padding: "8px 16px",
  background: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: 4,
  marginRight: "8px",
};

const cancelButtonStyle = {
  padding: "8px 16px",
  background: "#f44336",
  color: "white",
  border: "none",
  borderRadius: 4,
};
