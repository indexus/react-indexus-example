import { Item } from "js-indexus-sdk";
import { ipfs, getFileContent } from "./ipfsClient.js";
import { getCollection } from "./collection.js";

export async function addItem(cid, content, coordinates) {
  const data = await getCollection(cid);
  const itemData = {
    ...content,
  };

  const resp = await ipfs.add(JSON.stringify(itemData));
  const location = data.space.newPoint(coordinates);

  const hash = data.space.encode(location, 27);
  const item = new Item(data.collection.name(), hash, resp.cid.toString());

  // Note: Indexus instantiation (output and monitoring) should be handled in main.js
  return { item, itemCID: resp.cid.toString() };
}

export async function getItem(cid) {
  const itemData = JSON.parse(await getFileContent(cid));

  return {
    cid,
    content: itemData,
  };
}
