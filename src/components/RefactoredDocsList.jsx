// src/components/RefactoredDocsList.jsx
import documentsObject from "../models/document.js"
import { useState, useEffect } from "react";

function RefactoredDocsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const displayItemDetails = (item) => {
    setSelectedDoc(item);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(e.target);

    const title = formData.get('title');

    const content = formData.get('content');

    console.log('Updated:', { title, content });
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
      <div class="d-flex justify-content-center">
        <h1>Documents</h1>
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

        {selectedDoc && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Titel</label>
              <input 
                type="text" 
                name="title" 
                id="title"
                className = "form-control"
                defaultValue={selectedDoc.title || ''} 
              /><br></br>
            </div>
            <div className="form-group">
              <label htmlFor="content">Innehåll</label>
              <textarea 
                name="content" 
                id="content"
                defaultValue={selectedDoc.content || ''}
                className = "form-control"
              />
            </div>

            <button 
              className="btn btn-primary me-md-2"
              type="submit"
            >Uppdatera</button>

            <button
              className="btn btn-secondary me-md-2"
              type="button" 
              value="Avbryt"
            > Avbryt </button>
          </form>
        )}
      </div>
    </>
  );
}

export default RefactoredDocsList;