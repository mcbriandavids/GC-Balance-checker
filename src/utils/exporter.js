import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { COMPONENT_KEYS } from "./constants.js";

export const exportCsv = (rows, minMax, depthUnit = "m") => {
  if (!rows.length) return;

  // Sort rows by Depth
  const sortedRows = [...rows].sort(
    (a, b) => (a.input.Depth || 0) - (b.input.Depth || 0)
  );

  const data = sortedRows.map((r) => {
    const depth =
      depthUnit === "ft"
        ? (r.input.Depth * 3.28084).toFixed(2)
        : r.input.Depth.toFixed(2);
    const totalGasPct = Number(r.results.percent || 0).toFixed(2); // **Percentage first**
    const totalGasU = Number(r.input.TotalGas || 0).toFixed(2); // then unit
    const comps = COMPONENT_KEYS.map((k) => Number(r.input[k] || 0).toFixed(2));
    return [depth, totalGasPct, totalGasU, ...comps];
  });

  // Append Max Gas info
  const maxRow = rows.find((r) => Number(r.input.TotalGas || 0) === minMax.max);
  if (maxRow) {
    const depth =
      depthUnit === "ft"
        ? (maxRow.input.Depth * 3.28084).toFixed(2)
        : maxRow.input.Depth.toFixed(2);
    data.push([`Max Gas = ${Number(maxRow.input.TotalGas || 0).toFixed(2)}`]);
    COMPONENT_KEYS.forEach((k) =>
      data.push([`${k} = ${Number(maxRow.input[k] || 0).toFixed(2)}`])
    );
    data.push([`Depth = ${depth} ${depthUnit}`]);
  }

  const ws = XLSX.utils.aoa_to_sheet([
    ["Depth", "TotalGas (%)", "TotalGas (u)", ...COMPONENT_KEYS],
    ...data,
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  saveAs(
    new Blob([wbout], { type: "application/octet-stream" }),
    "gc_data.xlsx"
  );
};
