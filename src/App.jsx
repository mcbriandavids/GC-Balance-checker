import { useState, useEffect } from "react";
import { parseTextToRows } from "./utils/parser.js";
import { computeRow } from "./utils/calculator.js";
import { exportCsv } from "./utils/exporter.js";
import { HEADERS, COMPONENT_KEYS } from "./utils/constants.js";

import { DataTable } from "./components/DataTable.jsx";
import { Notification } from "./components/Notification.jsx";
import { Modal } from "./components/Modal.jsx";

export const App = () => {
  const [rows, setRows] = useState(() => {
    const stored = localStorage.getItem("gcRows");
    return stored ? JSON.parse(stored) : [];
  });
  const [overLimit, setOverLimit] = useState(false);
  const [minMax, setMinMax] = useState({ min: null, max: null });
  const [maxGasRow, setMaxGasRow] = useState(null);
  const [notification, setNotification] = useState(null);
  const [depthUnit, setDepthUnit] = useState("m");

  const [modal, setModal] = useState(null);
  const [pasteText, setPasteText] = useState("");

  // ✅ Track About modal separately
  const [aboutOpen, setAboutOpen] = useState(false);

  // Persist rows & compute limits
  useEffect(() => {
    localStorage.setItem("gcRows", JSON.stringify(rows));

    if (!rows.length) {
      setOverLimit(false);
      setMinMax({ min: null, max: null });
      setMaxGasRow(null);
      return;
    }

    const totalGasValues = rows.map((r) => Number(r.input.TotalGas || 0));
    setOverLimit(totalGasValues.some((v) => v > 50));

    const min = Math.min(...totalGasValues);
    const max = Math.max(...totalGasValues);
    setMinMax({ min, max });

    const maxRow = rows.find((r) => Number(r.input.TotalGas || 0) === max);
    setMaxGasRow(maxRow || null);

    if (totalGasValues.some((v) => v > 50)) {
      setNotification({ msg: "⚠️ TotalGas > 50", type: "warning" });
      const timer = setTimeout(() => setNotification(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [rows]);

  const showNotification = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
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
    if (parsed.length === 0) {
      setPasteText("");
      setModal(null);
      return;
    }

    const firstPastedDepth = Number(parsed[0].Depth || 0);
    const lastExistingDepth =
      rows.length > 0 ? Number(rows[rows.length - 1].input.Depth || 0) : null;

    if (lastExistingDepth !== null && firstPastedDepth <= lastExistingDepth) {
      const filtered = parsed.filter(
        (r) => Number(r.Depth || 0) > lastExistingDepth
      );
      if (filtered.length === 0) {
        showNotification(
          "ℹ️ Depth Pasted Already, only new depths will be appended.",
          "info"
        );
        setPasteText("");
        setModal(null);
        return;
      }
      setModal({
        type: "confirm",
        message:
          "⚠️ The pasted data contains existing depths. Append only new depths?",
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
    } else {
      addRowsFromParsed(parsed);
      setModal(null);
      setPasteText("");
    }
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
    if (window.electron) {
      window.electron.exitApp();
    } else {
      window.close();
    }
  };

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
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        <span>GC Balance Checker</span>
        <div>
          {/* About Button */}
          <button
            onClick={() => setAboutOpen(true)}
            style={{
              marginRight: "10px",
              padding: "6px 12px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: "#0078d7",
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
              background: "#e74c3c",
              border: "none",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
            }}
          >
            ❌ Exit
          </button>
        </div>
      </div>

      {/* Max Gas Summary */}
      {maxGasRow && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
            fontSize: "12px",
            marginBottom: 12,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr style={{ background: "#1976d2", color: "#fff" }}>
              <th style={{ border: "1px solid #ccc", padding: "6px" }}>
                Max TotalGas
              </th>
              <th style={{ border: "1px solid #ccc", padding: "6px" }}>
                Depth
              </th>
              {COMPONENT_KEYS.map((k) => (
                <th
                  key={k}
                  style={{ border: "1px solid #ccc", padding: "6px" }}
                >
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "6px",
                  fontWeight: "bold",
                  color: "#d32f2f",
                }}
              >
                {Number(maxGasRow.input.TotalGas).toFixed(2)}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "6px" }}>
                {convertDepth(maxGasRow.input.Depth)}
              </td>
              {COMPONENT_KEYS.map((k) => (
                <td
                  key={k}
                  style={{ border: "1px solid #ccc", padding: "6px" }}
                >
                  {Number(maxGasRow.input[k]).toFixed(2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}

      {/* Depth Unit */}
      <div style={{ marginBottom: "12px", textAlign: "center" }}>
        <label style={{ marginRight: 8, fontWeight: "bold" }}>
          Depth Unit:
        </label>
        <select
          value={depthUnit}
          onChange={(e) => setDepthUnit(e.target.value)}
          style={{
            padding: "4px 8px",
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
        >
          <option value="m">Meters (m)</option>
          <option value="ft">Feet (ft)</option>
        </select>
      </div>

      {/* Notifications */}
      {notification && (
        <Notification
          message={notification.msg}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Warning */}
      {overLimit && (
        <div
          style={{
            background: "#ff5722",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: 4,
            marginBottom: 8,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          TotalGas &gt; 50
        </div>
      )}

      {/* Main Controls */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <button
          onClick={handleManualPaste}
          style={{
            padding: "8px 16px",
            margin: "0 4px",
            borderRadius: 4,
            border: "none",
            background: "#1976d2",
            color: "white",
            cursor: "pointer",
          }}
        >
          📋 Paste Data
        </button>
        <button
          onClick={allGood ? () => exportCsv(rows, minMax, depthUnit) : null}
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
