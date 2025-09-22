// src/components/RefactoredDocsList.jsx
import documentsObject from "../models/document.js"
import { useState, useEffect } from "react";

function RefactoredDocsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDocs() {
      try {
        const documentFetchedData = await documentsObject.fetchDocuments();

        if (documentFetchedData) {
          setDocuments(documentFetchedData.data.result);
        }
      } catch (e) {
          setError(e.message);
      } finally {
          setLoading(false);
      }
    }
    loadDocs();
  }, []);

  if (loading) return <p>Loading documents...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <>
      <h1>Documents</h1>
      <ul className="list-group">
        {documents.map((item) => (
          <li
            key={item._id}
            className="list-group-item"
          >
            {item.title}
          </li>
        ))}
      </ul>
    </>
  );
}

export default RefactoredDocsList;
