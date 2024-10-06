import { create } from "ipfs-http-client";

const ipfs = create({ url: "http://ipfs.indexus.io:5001" });

export async function getFileContent(cid) {
  try {
    let content = "";
    const decoder = new TextDecoder("utf-8");

    for await (const chunk of ipfs.cat(cid)) {
      content += decoder.decode(chunk, { stream: true });
    }
    return content;
  } catch (error) {
    console.error("Error retrieving file from IPFS:", error);
    throw error;
  }
}

export { ipfs };
