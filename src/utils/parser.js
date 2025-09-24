import { HEADERS } from "./constants.js";

export const parseTextToRows = (text) => {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const delim = lines[0].includes("\t")
    ? "\t"
    : lines[0].includes(",")
    ? ","
    : /\s+/;

  const cells = lines.map((l) =>
    l.split(delim).map((s) => s.replace(/^["']|["']$/g, "").trim())
  );

  const firstIsHeader = isNaN(Number(cells[0][0]));
  const parsed = [];

  if (firstIsHeader) {
    const headerRow = cells[0].map((h) => h.trim());
    for (let i = 1; i < cells.length; i++) {
      const row = {};
      HEADERS.forEach((key, idx) => {
        const findIdx = headerRow.findIndex(
          (h) => h && h.toLowerCase() === key.toLowerCase()
        );
        const val = findIdx >= 0 ? cells[i][findIdx] : cells[i][idx];
        row[key] = key === "Depth" ? val ?? "" : val === "" ? "" : Number(val);
      });
      parsed.push(row);
    }
  } else {
    for (const r of cells) {
      const row = {};
      HEADERS.forEach((key, idx) => {
        row[key] =
          key === "Depth" ? r[idx] ?? "" : r[idx] === "" ? "" : Number(r[idx]);
      });
      parsed.push(row);
    }
  }
  return parsed;
};
