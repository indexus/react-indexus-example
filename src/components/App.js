// src/components/App.js
import React, { useState, useEffect } from "react";
import { createIndexus } from "../indexusClient.js";
import { CID } from "multiformats/cid";

import { createCollection, getCollection } from "../collection.js";
import { addItem, getItem } from "../item.js";

const App = () => {
  // State variables
  const [collectionName, setCollectionName] = useState("");
  const [collectionCID, setCollectionCID] = useState("");
  const [itemMessage, setItemMessage] = useState("");
  const [itemAuthor, setItemAuthor] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [indexusInstance, setIndexusInstance] = useState(null);

  // Initialize Indexus when collectionCID changes
  useEffect(() => {
    const initializeIndexus = async () => {
      if (collectionCID) {
        try {
          const collectionData = await getCollection(CID.parse(collectionCID));
          const origin = [[0, 0], [Date.now() / 1000]];
          const filters = [
            [
              [0, 0], // No distance and direction GPS filters
              [0, 360],
            ],
            [[0, 0], [0]], // No distance and direction time filters
          ];

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

  // Handle collection creation
  const handleCreateCollection = async () => {
    try {
      const collectionData = await createCollection(collectionName, [
        "gps",
        "time",
      ]);
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
      const { item, itemCID } = await addItem(CID.parse(collectionCID), {
        message: itemMessage,
        author: itemAuthor,
      });
      console.log("Item created with CID:", itemCID);
      if (indexusInstance) {
        await indexusInstance.addItem(item);
        console.log("Item added to the Indexus locality.");
      }
      setItemMessage("");
      setItemAuthor("");
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

  return (
    <div style={styles.container}>
      <h1>Indexus SDK Demo</h1>

      {/* Create Collection */}
      <section style={styles.section}>
        <h2>Create Collection</h2>
        <input
          type="text"
          placeholder="Collection Name"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleCreateCollection} style={styles.button}>
          Create Collection
        </button>
        {collectionCID && (
          <p>
            <strong>Collection CID:</strong> {collectionCID}
          </p>
        )}
      </section>

      {/* Add Item */}
      <section style={styles.section}>
        <h2>Add Item</h2>
        <input
          type="text"
          placeholder="Message"
          value={itemMessage}
          onChange={(e) => setItemMessage(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Author"
          value={itemAuthor}
          onChange={(e) => setItemAuthor(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleAddItem} style={styles.button}>
          Add Item
        </button>
      </section>

      {/* Search Collection */}
      <section style={styles.section}>
        <h2>Search Collection</h2>
        <input
          type="text"
          placeholder="Search Query"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSearch} style={styles.button}>
          Search
        </button>
        <div>
          <h3>Results:</h3>
          {searchResults.length > 0 ? (
            <ul>
              {searchResults.map((result, index) => (
                <li key={index}>{JSON.stringify(result)}</li>
              ))}
            </ul>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      </section>
    </div>
  );
};

// Simple inline styles
const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  section: {
    marginBottom: "40px",
  },
  input: {
    padding: "10px",
    marginRight: "10px",
    width: "200px",
  },
  button: {
    padding: "10px 20px",
  },
};

export default App;
