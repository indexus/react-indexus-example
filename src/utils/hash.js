import SHA256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";

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

  const hash = SHA256(data);

  // Convert the hash to a hex string
  const hashHex = hash.toString(Hex);

  return hexToBytes(hashHex);
};
