import { API, Network, Locality } from "js-indexus-sdk";

export function createIndexus(
  collection,
  space,
  origin,
  filters,
  output,
  monitoring,
  networkSettings = ["bootstrap.indexus.io|21000"]
) {
  const api = new API();
  const network = new Network(api, networkSettings);

  const spaces = {};
  spaces[collection.name()] = space;

  const options = {};
  for (let i = 0; i < space.size(); i++) {
    const dimension = space.dimension(i);

    options[dimension.name()] = {
      origin: dimension.newPoint(origin[dimension.name()]),
      filters: dimension.newFilter(
        filters[dimension.name()][0],
        filters[dimension.name()][1]
      ),
    };
  }

  const locality = new Locality(
    spaces,
    options,
    2, // Maximum number of sets to process per layer
    10, // Number of items to return per output step
    output,
    monitoring,
    network
  );

  return locality;
}
