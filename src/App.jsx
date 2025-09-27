import { useState, useEffect } from "react";
import { Loader } from "./components/Loader.jsx";
import { parseTextToRows } from "./utils/parser.js";
import { computeRow } from "./utils/calculator.js";
import { exportCsv } from "./utils/exporter.js";
import { HEADERS, COMPONENT_KEYS } from "./utils/constants.js";
import { DataTable } from "./components/DataTable.jsx";
import { SummaryTable } from "./components/Summary.jsx";
import { Notification } from "./components/Notification.jsx";
import { Modal } from "./components/Modal.jsx";

export const App = () => {
  const [rows, setRows] = useState(() => {
    const stored = localStorage.getItem("gcRows");
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(true);
  const [minMax, setMinMax] = useState({ min: null, max: null });
  const [notification, setNotification] = useState(null);
  const [depthUnit, setDepthUnit] = useState("m");
  // Helper to get Desktop path (Electron only)
  const getDesktopPath = () => {
    if (window && window.electron && window.electron.getDesktopPath) {
      return window.electron.getDesktopPath();
    }
    // fallback for dev: use home dir
    return (
      (window &&
        window.process &&
        window.process.env &&
        window.process.env.USERPROFILE) ||
      (window &&
        window.process &&
        window.process.env &&
        window.process.env.HOME) ||
      ""
    );
  };

  // Export handler: save to Desktop and auto-open
  const handleExport = (rows, minMax, depthUnit) => {
    const desktop = getDesktopPath();
    const fileName = `GC_Balance_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.xlsx`;
    // Use string concatenation for file path (Windows)
    const filePath = desktop ? `${desktop}\\${fileName}` : fileName;
    exportCsv(rows, minMax, depthUnit, filePath)
      .then(() => {
        if (window && window.electron && window.electron.openFile) {
          window.electron.openFile(filePath);
        }
        showNotification("✅ Exported to Desktop and opened in Excel", "info");
      })
      .catch(() => {
        showNotification("❌ Export failed", "error");
      });
  };
  const [modal, setModal] = useState(null);
  const [pasteText, setPasteText] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
    localStorage.setItem("gcRows", JSON.stringify(rows));

    if (!rows.length) {
      setMinMax({ min: null, max: null });
      return;
    }

    const totalGasValues = rows.map((r) => Number(r.input.TotalGas || 0));

    const min = Math.min(...totalGasValues);
    const max = Math.max(...totalGasValues);
    setMinMax({ min, max });

    if (totalGasValues.some((v) => v > 100)) {
      let intervalId;
      let timeoutId;
      const showMaxGasNotification = () => {
        // Find the row with the max gas
        let maxGas = -Infinity;
        let maxDepth = null;
        rows.forEach((r) => {
          const gas = Number(r.input.TotalGas || 0);
          if (gas > maxGas) {
            maxGas = gas;
            maxDepth = r.input.Depth;
          }
        });
        setNotification({
          msg: `🚨 Max Gas: ${maxGas} at Depth: ${maxDepth}`,
          type: "error",
        });
        timeoutId = setTimeout(() => {
          setNotification(null);
        }, 5000);
      };
      showMaxGasNotification();
      intervalId = setInterval(() => {
        showMaxGasNotification();
      }, 10000); // 5s show, 5s hide
      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    } else if (totalGasValues.some((v) => v > 50)) {
      setNotification({ msg: "⚠️ TotalGas > 50", type: "warning" });
      const timer = setTimeout(() => setNotification(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [rows]);

  const showNotification = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const convertDepth = (value) => {
    if (!value) return "0.00";
    const num = Number(value);
    if (isNaN(num)) return "0.00";
    return depthUnit === "ft" ? (num * 3.28084).toFixed(2) : num.toFixed(2);
  };

  const addRowsFromParsed = (parsed) => {
    const newRows = parsed.map((r, i) => {
      const input = {};
      HEADERS.forEach(
        (k) => (input[k] = r[k] === "" || r[k] === undefined ? 0 : Number(r[k]))
      );
      return {
        id: Date.now() + i,
        input,
        results: computeRow(input),
        normalized: false,
      };
    });
    setRows((prev) => [...prev, ...newRows]);
  };

  const handleManualPaste = () => {
    setModal({
      type: "paste",
      message: "📋 Paste rows (tab/comma/space-delimited):",
    });
  };

  const submitManualPaste = () => {
    if (!pasteText) return;

    const parsed = parseTextToRows(pasteText);
    // Validation: check for required fields and numeric values
    const requiredFields = HEADERS;
    const errors = [];
    parsed.forEach((row, idx) => {
      requiredFields.forEach((field) => {
        if (row[field] === undefined || row[field] === "") {
          errors.push(`Row ${idx + 1}: Missing value for ${field}`);
        } else if (field !== "Depth" && isNaN(Number(row[field]))) {
          errors.push(`Row ${idx + 1}: ${field} is not a valid number`);
        }
      });
    });
    if (errors.length > 0) {
      showNotification(`❌ Data Error: ${errors[0]}`, "error");
      return;
    }
    if (parsed.length === 0) {
      showNotification("❌ No valid rows detected.", "error");
      setPasteText("");
      setModal(null);
      return;
    }

    // Filter out any pasted rows with depths already present
    const existingDepths = new Set(rows.map((r) => Number(r.input.Depth)));
    const filtered = parsed.filter((r) => !existingDepths.has(Number(r.Depth)));
    if (filtered.length === 0) {
      showNotification(
        "ℹ️ All pasted depths already exist. No new rows added.",
        "info"
      );
      setPasteText("");
      setModal(null);
      return;
    }
    setModal({
      type: "confirm",
      message: `⚠️ ${
        parsed.length - filtered.length
      } depths already exist. Append only new depths?`,
      onConfirm: () => {
        addRowsFromParsed(filtered);
        setModal(null);
        setPasteText("");
      },
      onCancel: () => {
        setModal(null);
        setPasteText("");
      },
    });
  };

  const normalizeRow = (id) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const sumUnits = r.results.sumUnits;
        if (sumUnits === 0) return r;
        const factor = Number(r.input.TotalGas || 0) / sumUnits;
        const newInput = { ...r.input };
        COMPONENT_KEYS.forEach((k) => {
          newInput[k] = Number((newInput[k] * factor).toFixed(2));
        });
        return {
          ...r,
          input: newInput,
          results: computeRow(newInput),
          normalized: true,
        };
      })
    );
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const allGood = rows.length > 0 && rows.every((r) => r.results.ok);

  // ✅ IPC Exit
  const handleExit = () => {
    if (
      typeof window !== "undefined" &&
      window.electron &&
      typeof window.electron.exitApp === "function"
    ) {
      window.electron.exitApp();
    } else if (
      typeof window !== "undefined" &&
      typeof window.close === "function"
    ) {
      window.close();
    }
  };

  if (loading) return <Loader />;
  return (
    <div
      className="container"
      style={{ padding: 16, fontFamily: "Arial, sans-serif" }}
    >
      {/* ✅ Header with Exit + About */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#2c3e50",
          color: "#ecf0f1",
          padding: "12px 16px",
          borderRadius: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          marginBottom: "16px",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: 20 }}>
          GC Balance Checker
        </div>
        <div>
          <button
            onClick={() => setAboutOpen(true)}
            style={{
              marginRight: 8,
              padding: "6px 12px",
              borderRadius: 4,
              border: "none",
              background: "#2980b9",
              color: "white",
              cursor: "pointer",
            }}
          >
            About
          </button>
          <button
            onClick={handleExit}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "none",
              background: "#e74c3c",
              color: "white",
              cursor: "pointer",
            }}
          >
            Exit
          </button>
        </div>
      </div>

      {/* ✅ Notification */}
      {notification && (
        <Notification message={notification.msg} type={notification.type} />
      )}

      {/* ✅ Paste/Export/Clear Controls */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleManualPaste}
            style={{
              padding: "8px 16px",
              margin: "0 4px",
              borderRadius: 4,
              border: "none",
              background: "#607d8b",
              color: "white",
              cursor: "pointer",
            }}
          >
            📋 Paste Data
          </button>
          {/* Depth Unit Dropdown */}
          <select
            value={depthUnit}
            onChange={(e) => setDepthUnit(e.target.value)}
            style={{
              padding: "8px 12px",
              margin: "0 8px 0 0",
              borderRadius: 4,
              border: "1px solid #607d8b",
              background: "#f5f5f5",
              color: "#333",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            title="Select depth unit"
          >
            <option value="m">Meters (m)</option>
            <option value="ft">Feet (ft)</option>
          </select>

          <button
            onClick={
              allGood ? () => handleExport(rows, minMax, depthUnit) : null
            }
            disabled={!allGood}
            style={{
              padding: "8px 16px",
              margin: "0 4px",
              borderRadius: 4,
              border: "none",
              background: allGood ? "#4caf50" : "#9e9e9e",
              color: "white",
              cursor: allGood ? "pointer" : "not-allowed",
            }}
          >
            📤 Export
          </button>
          <button
            onClick={() => setRows([])}
            style={{
              padding: "8px 16px",
              margin: "0 4px",
              borderRadius: 4,
              border: "none",
              background: "#f44336",
              color: "white",
              cursor: "pointer",
            }}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Max Gas / Equivalent Depth / Breakdown Summary */}
      <SummaryTable rows={rows} depthUnit={depthUnit} />

      {/* Data Table */}
      <DataTable
        rows={rows}
        minMax={minMax}
        updateCell={null}
        removeRow={removeRow}
        normalizeRow={normalizeRow}
        depthUnit={depthUnit}
        convertDepth={convertDepth}
      />

      {/* ✅ Modal Integration */}
      {modal && (
        <Modal
          type={modal.type}
          message={modal.message}
          pasteText={pasteText}
          setPasteText={setPasteText}
          onConfirm={
            modal.type === "paste" ? submitManualPaste : modal.onConfirm
          }
          onCancel={() => {
            setModal(null);
            setPasteText("");
            if (modal.onCancel) modal.onCancel();
          }}
        />
      )}

      {/* ✅ About Modal */}
      {aboutOpen && (
        <Modal
          type="info"
          message={
            <div style={{ textAlign: "left" }}>
              <h2>About GC Balance Checker</h2>
              <p>
                This application helps you analyze Gas Chromatography (GC) data
                with balance checks, normalization, and export options.
              </p>
              <ul>
                <li>📋 Paste data directly into the app.</li>
                <li>✅ Normalize gas components against TotalGas.</li>
                <li>⚠️ Get alerts if TotalGas exceeds 50.</li>
                <li>📤 Export your data as CSV when normalized.</li>
              </ul>
              <p>
                Designed & developed by <b>Imonisa Oghenekevwe Brian</b>.
              </p>
            </div>
          }
          onConfirm={() => setAboutOpen(false)}
          onCancel={() => setAboutOpen(false)}
        />
      )}
    </div>
  );
};
