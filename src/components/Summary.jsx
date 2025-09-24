import { COMPONENT_KEYS } from "../utils/constants";

export const SummaryTable = ({ rows }) => {
  if (!rows.length) return null;

  // Find max gas and its depth
  const maxRow = rows.reduce(
    (max, r) => (r.input.TotalGas > max.input.TotalGas ? r : max),
    rows[0]
  );

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "center",
        fontSize: "12px",
        marginBottom: "10px",
      }}
    >
      <thead>
        <tr>
          <th style={{ border: "1px solid #ccc", padding: "4px" }}>
            Max Depth
          </th>
          <th style={{ border: "1px solid #ccc", padding: "4px" }}>
            Max Gas (u)
          </th>
          <th style={{ border: "1px solid #ccc", padding: "4px" }}>
            Max Gas (%)
          </th>
          {COMPONENT_KEYS.map((k) => (
            <th key={k} style={{ border: "1px solid #ccc", padding: "4px" }}>
              {k}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ border: "1px solid #ccc", padding: "4px" }}>
            {maxRow.input.Depth}
          </td>
          <td style={{ border: "1px solid #ccc", padding: "4px" }}>
            {maxRow.input.TotalGas.toFixed(2)}
          </td>
          <td style={{ border: "1px solid #ccc", padding: "4px" }}>
            {maxRow.results.percent.toFixed(2)}
          </td>
          {COMPONENT_KEYS.map((k) => (
            <td key={k} style={{ border: "1px solid #ccc", padding: "4px" }}>
              {maxRow.input[k].toFixed(2)}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};
