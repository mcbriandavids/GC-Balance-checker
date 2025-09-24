import {
  COMPONENT_KEYS,
  PPM_PER_UNIT,
  TOLERANCE_FRACTION,
} from "./constants.js";

export const computeRow = (row) => {
  const compUnits = {};
  let sumUnits = 0;

  for (const key of COMPONENT_KEYS) {
    const ppm = Number(row[key] || 0);
    const units = ppm / PPM_PER_UNIT;
    compUnits[key] = units;
    sumUnits += units;
  }

  const reported = Number(row.TotalGas || 0);
  const ok =
    Math.abs(sumUnits - reported) <= Math.abs(reported) * TOLERANCE_FRACTION;

  const totalPpm = reported * PPM_PER_UNIT;
  const percent = totalPpm / 10000;

  return { compUnits, sumUnits, ok, percent };
};
