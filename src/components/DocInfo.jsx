// src/components/DocInfo.jsx
import documentsObject from "../models/document.js"
import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';

import CodeEditor from "./CodeEditor.jsx";

import { socket } from "../socket.js";

function DocInfo() {
  const [document, setDocument] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id, index } = useParams();
  const navigate = useNavigate();

  // Editor variables
  const [editorState, setEditorState] = useState(false); // Boolean
  const editorString = editorState ? "Document" : "Editor";
  const docType = editorState ? "js" : "doc";
  const [codeResponse, setCodeResponse ] = useState("");

  // This switches between editor and document;
  const handleEditorState = () => {
    setEditorState(prev => !prev);
  }

  const handleExecuteCode = async () => {
    let data = {
      code: btoa(document.content)
    };

    let res = documentsObject.executeCode(data);
    setCodeResponse(res);
  }

  const handleChangeEditor = (code) => {
    setDocument(prev => ({ ...prev, content: code}));
    socket.emit("update_doc", { id: `${id}/${index}`, data: {...document, content: code, doc_type: docType}});
  }

  const handleCancelButton = () => {
    navigate('/ssr-frontend/');
  }

  const handleShareDocument = () => {
    navigate(`/ssr-frontend/share-document/${id}/${index}`);
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

  // Handle typing locally
  const handleChange = (e) => {
    const { name, value } = e.target; // name="title" or "content"
    setDocument(prev => ({ ...prev, [name]: value }));
        
    // Emit update to server
    socket.emit("update_doc", { id: `${id}/${index}`, data: {...document, [name]: value, doc_type: docType} });
  }

  async function checkCookies () {
    // cookies
    const cookies = await documentsObject.checkCookies();
    if (!cookies.authorized) {
      navigate("/ssr-frontend/login");
      return;
    }
  }

  async function loadDocInfo() {
      try {
        // Fetching
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

  async function handleSockets() {
    socket.emit("join_room", {id: id, index: index});

    const handleUpdate = (update) => {
      setDocument(update);
    }

    socket.on("doc_updated", handleUpdate);

    // Cleanup when leaving the page
    return () => {
      socket.off("doc_updated", handleUpdate);
    };

  }


  useEffect(() => {
    checkCookies();
    loadDocInfo();
    handleSockets();

  }, [id, index]);

  if (loading) return <p>Loading doc's info...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <>
      <div className="container mt-4">
        <h1 >Documents {} </h1>
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
                  value={document.title || ''}
                  // value={document.title || ''}
                  onChange={handleChange}
                /><br></br>
              </div>

              <div className="form-group">
                <label htmlFor="content">Innehåll</label>

                {editorState && <CodeEditor 
                value={document.content || ''}
                name="editor"
                id="editor"
                className = "form-control"
                onChange={handleChangeEditor}
                />
                }

                {!editorState && <textarea
                  name="content"
                  id="content"
                  value={document.content || ''}
                  onChange={handleChange}
                  className = "form-control"
                />}
              </div>

              {editorState && 
                <div className="form-group">
                  <p>
                    {codeResponse}
                  </p>
                </div>
              
              }

              <button
                className="btn btn-primary me-md-2"
                type="submit"
              >Uppdatera</button>

              <button
                className="btn btn-secondary me-md-2"
                type="button"
                onClick={handleCancelButton}
              > Avbryt </button>
            </form>
          )}
        </div>

          <br/>
        <button
          className="btn btn-secondary me-md-2"
          type="button"
          onClick={handleShareDocument}
        > Dela dokument </button>

        <button
          className="btn btn-secondary me-md-2"
          type="button"
          onClick={handleEditorState}
        > Switch to {String(editorString)} </button>

        {editorState &&
        <button
          className="btn btn-primary me-md-2"
          type="button"
          onClick={handleExecuteCode}
        > Exekvera kod </button>
        }
      </div>
    </>
  );
}

export default DocInfo;