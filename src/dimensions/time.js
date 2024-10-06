// src/dimensions/time.js
export const timeDimension = {
  label: "Timestamp",
  name: "time",
  type: "linear",
  args: [
    -126230400 * 16 * 16 * 8, // Example lower bound
    126230400 * 16 * 16 * 8, // Example upper bound
  ],
};
