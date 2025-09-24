export const Notification = ({ message, type = "info", onClose }) => {
  if (!message) return null;

  const bg = {
    info: "#2196f3",
    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
  }[type];

  return (
    <div
      style={{
        background: bg,
        color: "#fff",
        padding: "8px 12px",
        borderRadius: 4,
        marginBottom: 8,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        ✖
      </button>
    </div>
  );
};
