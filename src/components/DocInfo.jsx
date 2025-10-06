// src/components/DocInfo.jsx
import documentsObject from "../models/document.js"
import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';

function DocInfo() {
  const [document, setDocument] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id, index } = useParams();
  const navigate = useNavigate();

  const handleCancelButton = () => {
    navigate('/ssr-frontend/');
  }

  const handleSubmitButton = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const updatedDoc = {
        title: formData.get("title"),
        content: formData.get("content"),
    };

    await documentsObject.updateDocumentByID(id, index, updatedDoc);
    navigate('/ssr-frontend/');
  }

  useEffect(() => {
    async function loadDocInfo() {
      try {

        const cookies = await documentsObject.checkCookies();

        if (!cookies.authorized) {
          navigate("/ssr-frontend/login");
          return;
        }

        const documentFetchedData = await documentsObject.fetchDocumentByID(id, index);
        if (documentFetchedData) {
          setDocument(documentFetchedData.data);
        }
      } catch (e) {
          setError(e.message);
      } finally {
          setLoading(false);
      }
    }
    loadDocInfo();
  }, []);

  if (loading) return <p>Loading doc's info...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <>
      <div className="container mt-4">
        <h1 >Documents</h1>
        <div className="row">
          <div className="col-md-6"></div>
            <ul className="list-group">
                <li
                    key={document._id}
                    className="list-group-document"
                    onClick={() => displayDocumentDetails(document)}
                >
                    {document.title}
                </li>
            </ul>
          </div>

        <div className="col-md-6">
          {document && (
            <form onSubmit={handleSubmitButton}>
              <div className="form-group mb-3">
                <label htmlFor="title">Titel</label>
                <input 
                  type="text"
                  name="title"
                  id="title"
                  className = "form-control"
                  defaultValue={document.title || ''}
                /><br></br>
              </div>
              <div className="form-group">
                <label htmlFor="content">Innehåll</label>
                <textarea
                  name="content"
                  id="content"
                  defaultValue={document.content || ''}
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
                onClick={handleCancelButton}
              > Avbryt </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default DocInfo;