import { COMPONENT_KEYS } from "../utils/constants";

export const SummaryTable = ({ rows, depthUnit = "m" }) => {
  if (!rows.length) return null;

  // Helper to convert depth
  const getDepth = (depth) => {
    if (depthUnit === "ft") {
      return (Number(depth) * 3.28084).toFixed(2);
    }
    return Number(depth).toFixed(2);
  };

  // Find max gas row for highlight
  const maxRow = rows.reduce(
    (max, r) => (r.input.TotalGas > max.input.TotalGas ? r : max),
    rows[0]
  );
  // Calculate percent for total gas
  const totalGasSum = rows.reduce(
    (sum, r) => sum + Number(r.input.TotalGas),
    0
  );
  const percent =
    totalGasSum > 0
      ? ((maxRow.input.TotalGas / totalGasSum) * 100).toFixed(2)
      : "0.00";

  return (
    <div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center",
          fontSize: "13px",
          marginBottom: "10px",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "4px" }}>
              Depth ({depthUnit})
            </th>
            <th style={{ border: "1px solid #ccc", padding: "4px" }}>
              Max Total Gas (unit)
            </th>
            <th style={{ border: "1px solid #ccc", padding: "4px" }}>
              Max Total Gas (%)
            </th>
            {COMPONENT_KEYS.map((k) => (
              <th key={k} style={{ border: "1px solid #ccc", padding: "4px" }}>
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr style={{ background: "#ffe082", fontWeight: "bold" }}>
            <td style={{ border: "1px solid #ccc", padding: "4px" }}>
              {getDepth(maxRow.input.Depth)}
            </td>
            <td style={{ border: "1px solid #ccc", padding: "4px" }}>
              {maxRow.input.TotalGas.toFixed(2)}
            </td>
            <td style={{ border: "1px solid #ccc", padding: "4px" }}>
              {percent}%
            </td>
            {COMPONENT_KEYS.map((k) => (
              <td key={k} style={{ border: "1px solid #ccc", padding: "4px" }}>
                {maxRow.input[k].toFixed(2)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
