// src/components/RefactoredDocsList.jsx
import documentsObject from "../models/document.js"
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function RefactoredDocsList() {
  const [item_id, setItemID] = useState(String);
  const [documents, setDocuments] = useState([]);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

const handleCreateButton = () => {
  navigate(`/ssr-frontend/create-doc`);
}

const displayItemDetails = (item, index) => {
  navigate(`/ssr-frontend/${item_id}/${index}`);
}

const displaySharedDetails = (item, index) => {
  navigate(`/ssr-frontend/${item.id}/${index}`);
}

  useEffect(() => {
    async function loadDocs() {
      try {

        const cookies = await documentsObject.checkCookies();

        if (!cookies.authorized) {
          navigate("/ssr-frontend/login");
          return;
        }

        const documentFetchedData = await documentsObject.fetchDocuments();
        const result = documentFetchedData?.data?.result;
        const sharedResults = documentFetchedData?.data.sharedResult;

        console.log(sharedResults);

        if (sharedResults) {
          setSharedDocuments(sharedResults);
        } else {
          setSharedDocuments([]);
        }

        setItemID(result[0]._id);
        if (result) {
          setDocuments(result[0].docs || []);
        } else {
          setDocuments([]);
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
      <h1>Mina dokument</h1>
        <div className="row g-4">
          {documents.map((item, index) => (
            <div key={index} className="col-md-4">
              <div
                className="card h-100 shadow-sm p-3"
                onClick={() => displayItemDetails(item, index)}
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
        {sharedDocuments.length > 0 && <h1>Delade dokument</h1>}

        <div className="row g-4">
          {sharedDocuments.map((item, index) => (
            <div key={index} className="col-md-4">
              <div
                className="card h-100 shadow-sm p-3"
                onClick={() => displaySharedDetails(item, item.index)}
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