// src/components/RefactoredDocsList.jsx
import documentsObject from "../models/document.js"
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function RefactoredDocsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

const handleCreateButton = () => {
  navigate(`/create-doc`);
}

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
      <div className="container mt-4 g-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 >Documents</h1>
          <button
            className="btn btn-primary me-md-2"
            type="button"
            value="Create"
            onClick={handleCreateButton}
          >+ Create a new doc</button>
        </div>

        <div className="row g-4">
          {documents.map((item) => (
            <div key={item._id} className="col-md-4">
              <div
                className="card h-100 shadow-sm p-3"
                onClick={() => displayItemDetails(item)}
                style={{ cursor: "-moz-grab" }}
              >
                <h5 className="card-title">{item.title}</h5>
                <p className="card-text text-muted">
                  {item.content?.slice(0, 80)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default RefactoredDocsList;