import { ipcRenderer } from "electron";

export const Header = ({ onAbout }) => {
  const handleExit = () => {
    ipcRenderer.send("exit-app");
  };

  return (
    <div
      style={{
        width: "100%",
        background: "#2c3e50",
        color: "white",
        padding: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        userSelect: "none",
      }}
    >
      <div style={{ fontWeight: "bold" }}>GC Balance Checker</div>
      <div>
        <button
          onClick={onAbout}
          style={{
            marginRight: "10px",
            background: "#1976d2",
            border: "none",
            color: "white",
            padding: "6px 12px",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          ℹ️ About
        </button>
        <button
          onClick={handleExit}
          style={{
            background: "#f44336",
            border: "none",
            color: "white",
            padding: "6px 12px",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          ❌ Exit
        </button>
      </div>
    </div>
  );
};
