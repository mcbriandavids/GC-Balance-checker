export const Controls = ({
  onManualPaste,
  onExport,
  onClear,
  exportDisabled,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "12px",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      {/* Paste */}
      <button
        onClick={onManualPaste}
        style={{
          padding: "8px 16px",
          border: "1px solid #1976d2",
          background: "#1976d2",
          color: "#fff",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Paste Data
      </button>

      {/* Export */}
      <button
        onClick={onExport}
        disabled={exportDisabled}
        style={{
          padding: "8px 16px",
          border: "1px solid #388e3c",
          background: exportDisabled ? "#9e9e9e" : "#388e3c",
          color: "#fff",
          borderRadius: "6px",
          cursor: exportDisabled ? "not-allowed" : "pointer",
          fontWeight: "bold",
        }}
      >
        Export CSV
      </button>

      {/* Clear */}
      <button
        onClick={onClear}
        style={{
          padding: "8px 16px",
          border: "1px solid #d32f2f",
          background: "#d32f2f",
          color: "#fff",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Clear Data
      </button>
    </div>
  );
};
