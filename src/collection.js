import { Collection, Space, encodeUrl64 } from "js-indexus-sdk";
import { ipfs, getFileContent } from "./ipfsClient.js";
import { getDimension } from "./dimensions/index.js";

import { sha256 } from "./utils/hash.js";

export async function createCollection(title, dimensions) {
  const data = {
    name: title,
    dimensions: [],
  };

  dimensions.forEach((dimension) =>
    data.dimensions.push(getDimension(dimension))
  );

  const resp = await ipfs.add(JSON.stringify(data));
  const hash = encodeUrl64(
    (await sha256(resp.cid.toString())).toString()
  ).slice(0, 27);

  const collection = new Collection(hash, data.dimensions);

  const space = new Space(
    collection.dimensions(),
    collection.mask(),
    collection.offset()
  );

  return {
    cid: resp.cid.toString(),
    collection,
    space,
  };
}

export async function getCollection(cid) {
  const data = JSON.parse(await getFileContent(cid));

  const hash = encodeUrl64((await sha256(cid.toString())).toString()).slice(
    0,
    27
  );

  const collection = new Collection(hash, data.dimensions);

  const space = new Space(
    collection.dimensions(),
    collection.mask(),
    collection.offset()
  );

  return {
    cid,
    collection,
    space,
  };
}
