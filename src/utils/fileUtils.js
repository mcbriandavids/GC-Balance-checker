import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Headers from "./parser";
import { COMPONENT_KEYS } from "./calculator";

// You should implement this function in your app to show errors in a user-friendly way (e.g., toast notification)
function handleCsvParseError(err) {
  // Example: Replace with your preferred error UI
  console.error("CSV parse error:", err.message);
}

export function importCSV(file, addRowsFromParsed) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (res) => {
      const normalized = res.data.map((r) => {
        const row = {};
        Headers.forEach((h) => {
          const found = Object.keys(r).find(
            (k) => k && k.toLowerCase().trim() === h.toLowerCase()
          );
          row[h] = found ? r[found] : r[h] ?? "";
        });
        return row;
      });
      addRowsFromParsed(normalized);
    },
    error: handleCsvParseError,
  });
}

const DEFAULT_EXPORT_FILENAME = "gc_check_results.csv";

export function exportCsv(rows, minMax, fileName = DEFAULT_EXPORT_FILENAME) {
  const cols = [
    "Depth",
    "TotalGas",
    ...COMPONENT_KEYS,
    "SumUnits",
    "TotalGas(%)",
    "Status",
    "Flag",
  ];
  const lines = [cols.join(",")];
  rows.forEach((r) => {
    const tg = Number(r.input.TotalGas || 0);
    let flag = "";
    if (tg === minMax.max) flag = "MAX";
    if (tg === minMax.min) flag = "MIN";

    const values = [
      r.input.Depth ?? "",
      r.input.TotalGas ?? "",
      ...COMPONENT_KEYS.map((k) => r.input[k] ?? ""),
      (r.results.sumUnits || 0).toFixed(6),
      (r.results.percent || 0).toFixed(6),
      r.results.ok ? "✔" : "✖",
      flag,
    ];
    lines.push(values.join(","));
  });
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  saveAs(blob, fileName);
}
