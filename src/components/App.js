// src/components/App.js
import React, { useState, useEffect } from "react";
import { createIndexus } from "../indexusClient.js";
import { CID } from "multiformats/cid";

import { createCollection, getCollection } from "../collection.js";
import { addItem, getItem } from "../item.js";

// Optional: Import CSS for better styling
import "./App.css";

const App = () => {
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const generateRandomNumber = (min = 1000, max = 9999) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // State variables
  const [collectionName, setCollectionName] = useState("hello_world"); // <-- Updated here
  const [selectedDimensions, setSelectedDimensions] = useState({
    time: true,
    gps: false,
  });
  const [collectionCID, setCollectionCID] = useState("");
  const [itemMessage, setItemMessage] = useState("Hello w0rld!");
  const [itemAuthor, setItemAuthor] = useState(
    `Stranger ${generateRandomNumber()}`
  );
  const [itemTime, setItemTime] = useState(getCurrentDateTimeLocal());
  const [itemGPS, setItemGPS] = useState({ latitude: "", longitude: "" });
  const [searchResults, setSearchResults] = useState([]);
  const [indexusInstance, setIndexusInstance] = useState(null);

  // Initialize Indexus when collectionCID changes
  useEffect(() => {
    const initializeIndexus = async () => {
      if (collectionCID) {
        try {
          const collectionData = await getCollection(CID.parse(collectionCID));
          const origin = {
            linear: [251480140800],
            sperical: [0, 0],
          };

          const filters = {
            linear: [[0, 0], [-1]], // No distance and direction time filters
            sperical: [
              [0, 0], // No distance and direction GPS filters
              [0, 360],
            ],
          };

          const indexus = createIndexus(
            collectionData.collection,
            collectionData.space,
            origin,
            filters,
            {
              send: async (result) => {
                try {
                  const messages = await Promise.all(
                    result.map(async (item) => {
                      const message = await getItem(CID.parse(item.id()));
                      return message.content;
                    })
                  );
                  setSearchResults(messages);
                } catch (error) {
                  console.error("Error processing items:", error);
                }
              },
            },
            {
              send: (message) => {
                // Implement monitoring logic here if needed
                console.log("Monitoring:", message);
              },
            }
          );

          setIndexusInstance(indexus);
        } catch (error) {
          console.error("Error initializing Indexus:", error);
        }
      }
    };

    initializeIndexus();
  }, [collectionCID]);

  // Effect to set current time when time dimension is selected
  useEffect(() => {
    if (selectedDimensions.time && !itemTime) {
      setItemTime(getCurrentDateTimeLocal());
    }
  }, [selectedDimensions.time]);

  // Handle collection creation
  const handleCreateCollection = async () => {
    try {
      const dimensions = [];
      if (selectedDimensions.gps) dimensions.push("gps");
      if (selectedDimensions.time) dimensions.push("time");

      if (dimensions.length === 0) {
        alert("Please select at least one dimension to index.");
        return;
      }

      const collectionData = await createCollection(collectionName, dimensions);
      console.log("Collection created with CID:", collectionData.cid);
      setCollectionCID(collectionData.cid.toString());
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  // Handle adding an item
  const handleAddItem = async () => {
    try {
      if (!collectionCID) {
        alert("Please create a collection first.");
        return;
      }

      const itemData = {
        message: itemMessage,
        author: itemAuthor,
      };

      const coordonates = [];

      // Add coordinates based on selected dimensions
      if (selectedDimensions.time && itemTime) {
        const timestamp = new Date(itemTime).getTime();
        itemData.time = timestamp;
        coordonates.push([itemData.time]);
      }

      if (selectedDimensions.gps && itemGPS.latitude && itemGPS.longitude) {
        itemData.gps = {
          latitude: parseFloat(itemGPS.latitude),
          longitude: parseFloat(itemGPS.longitude),
        };
        coordonates.push([itemData.gps.latitude], [itemData.gps.longitude]);
      }

      const { item, itemCID } = await addItem(
        CID.parse(collectionCID),
        itemData,
        coordonates
      );
      console.log("Item created with CID:", itemCID);
      if (indexusInstance) {
        await indexusInstance.addItem(item);
        console.log("Item added to the Indexus locality.");
      }
      // Reset item fields
      setItemMessage("");
      setItemAuthor("");
      setItemTime("");
      setItemGPS({ latitude: "", longitude: "" });
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Handle search
  const handleSearch = async () => {
    try {
      if (!indexusInstance) {
        alert("Please create a collection first.");
        return;
      }
      // Implement search parameters as needed
      await indexusInstance.search();
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  // Handle dimension selection
  const handleDimensionChange = (e) => {
    const { name, checked } = e.target;
    setSelectedDimensions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  return (
    <div className="container">
      <h1>Indexus SDK Demo</h1>

      {/* Create Collection */}
      <section className="section">
        <h2>Create Collection</h2>
        <input
          type="text"
          placeholder="Collection Name"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          className="input"
        />
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="time"
              checked={selectedDimensions.time}
              onChange={handleDimensionChange}
            />
            Time
          </label>
          <label>
            <input
              type="checkbox"
              name="gps"
              checked={selectedDimensions.gps}
              onChange={handleDimensionChange}
            />
            GPS
          </label>
        </div>
        <button onClick={handleCreateCollection} className="button">
          Create Collection
        </button>
        {collectionCID && (
          <p>
            <strong>Collection CID:</strong> {collectionCID}
          </p>
        )}
      </section>

      {/* Add Item */}
      <section className="section">
        <h2>Add Item</h2>
        <input
          type="text"
          placeholder="Message"
          value={itemMessage}
          onChange={(e) => setItemMessage(e.target.value)}
          className="input"
        />
        <input
          type="text"
          placeholder="Author"
          value={itemAuthor}
          onChange={(e) => setItemAuthor(e.target.value)}
          className="input"
        />

        {/* Conditionally render coordinate inputs based on selected dimensions */}
        {selectedDimensions.time && (
          <input
            type="datetime-local"
            placeholder="Time"
            value={itemTime}
            onChange={(e) => setItemTime(e.target.value)}
            className="input"
          />
        )}
        {selectedDimensions.gps && (
          <div className="gps-inputs">
            <input
              type="number"
              placeholder="Latitude"
              value={itemGPS.latitude}
              onChange={(e) =>
                setItemGPS((prev) => ({ ...prev, latitude: e.target.value }))
              }
              className="input"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={itemGPS.longitude}
              onChange={(e) =>
                setItemGPS((prev) => ({ ...prev, longitude: e.target.value }))
              }
              className="input"
            />
          </div>
        )}
        <button onClick={handleAddItem} className="button">
          Add Item
        </button>
      </section>

      {/* Search Collection */}
      <section className="section">
        <h2>Search Collection</h2>
        <button onClick={handleSearch} className="button">
          Search
        </button>
        <div className="results">
          <h3>Results:</h3>
          {searchResults.length > 0 ? (
            <div className="cards-container">
              {searchResults.map((result, index) => (
                <Card key={index} item={result} />
              ))}
            </div>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      </section>
    </div>
  );
};

// Card Component to display individual items
const Card = ({ item }) => {
  const formattedDate = item.time
    ? new Date(item.time).toLocaleString()
    : "N/A";
  const gps =
    item.gps && item.gps.latitude && item.gps.longitude
      ? `Lat: ${item.gps.latitude}, Lon: ${item.gps.longitude}`
      : "N/A";

  return (
    <div className="card">
      <h4>{item.message}</h4>
      <p>
        <strong>Author:</strong> {item.author}
      </p>
      {item.time && (
        <p>
          <strong>Time:</strong> {formattedDate}
        </p>
      )}
      {item.gps && (
        <p>
          <strong>GPS:</strong> {gps}
        </p>
      )}
    </div>
  );
};

export default App;
