// src/components/RefactoredDocsList.jsx
import documentsObject from "../models/document.js"
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function RefactoredDocsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

const displayItemDetails = (item) => {
  navigate(`/${item._id}`);
}

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
      <div class="container mt-4">
        <h1 >Documents</h1>
        <div className="row">
          <div className="col-md-6"></div>
            <ul className="list-group">
              {documents.map((item) => (
                <li
                  key={item._id}
                  className="list-group-item"
                  onClick={() => displayItemDetails(item)}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
      </div>
    </>
  );
}

export default RefactoredDocsList;