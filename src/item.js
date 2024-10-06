import { Item } from "js-indexus-sdk";
import { ipfs, getFileContent } from "./ipfsClient.js";
import { getCollection } from "./collection.js";

export async function addItem(
  cid,
  content,
  coordinates = [[13.456, 110.124], [Date.now() / 1000]]
) {
  const data = await getCollection(cid);

  const point = {};
  for (let i = 0; i < data.space.size(); i++) {
    point[data.space.dimension(i).name()] = coordinates[i];
  }

  const itemData = {
    ...content,
    coordinates: point,
  };

  const resp = await ipfs.add(JSON.stringify(itemData));

  const location = data.space.newPoint([
    itemData.coordinates.spherical,
    itemData.coordinates.linear,
  ]);

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
