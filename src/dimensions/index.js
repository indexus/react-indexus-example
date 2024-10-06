import { gpsDimension } from "./gps.js";
import { timeDimension } from "./time.js";

export const dimensions = [gpsDimension, timeDimension];

// Optionally, you can add functions to retrieve specific dimensions
export function getDimension(name) {
  return dimensions.find((dim) => dim.name === name);
}
