// Function to convert ArrayBuffer to Hex String
const arrayBufferToHex = (buffer) => {
  const byteArray = new Uint8Array(buffer);
  const hexCodes = [...byteArray].map((value) => {
    const hexCode = value.toString(16);
    return hexCode.padStart(2, "0");
  });
  return hexCodes.join("");
};

const hexToBytes = (hex) => {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return new Uint8Array(bytes);
};

// Function to perform SHA-256 hashing
export const sha256 = async (message) => {
  // Encode the message as UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  // Perform the hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert the hash to hex
  const hashHex = arrayBufferToHex(hashBuffer);

  return hexToBytes(hashHex);
};
