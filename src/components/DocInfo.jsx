// src/components/DocInfo.jsx
import documentsObject from "../models/document.js";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import CodeEditor from "./CodeEditor.jsx";

import { socket } from "../socket.js";

import ToolBar from "./ToolBar.jsx";
import CommentableViewer from "./CommentableViewer.jsx";

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
  const [codeResponse, setCodeResponse] = useState("");
  const [comments, setComments] = useState([]);

  function onAddCommentLocal(c) {
    // c = { id, start, end, note }
    const payload = { docId: `${id}/${index}`, ...c };
    setComments((prev) => [...prev, payload]);
    socket.emit("add_comment", payload);
  }

  // This switches between editor and document;
  const handleEditorState = () => {
    setEditorState((prev) => !prev);
  };

  const handleExecuteCode = async () => {
    let data = {
      code: btoa(document.content),
    };

    let res = documentsObject.executeCode(data);
    setCodeResponse(res);
  };

  const handleChangeEditor = (code) => {
    setDocument((prev) => ({ ...prev, content: code }));
    socket.emit("update_doc", {
      id: `${id}/${index}`,
      data: { ...document, content: code, doc_type: docType },
    });
  };

  const handleCancelButton = () => {
    navigate("/ssr-frontend/");
  };

  const handleShareDocument = () => {
    navigate(`/ssr-frontend/share-document/${id}/${index}`);
  };

  const handleSubmitButton = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const updatedDoc = {
      title: formData.get("title"),
      content: formData.get("content"),
    };

    await documentsObject.updateDocumentByID(id, index, updatedDoc);
    navigate("/ssr-frontend/");
  };

  // Handle typing locally
  const handleChange = (e) => {
    const { name, value } = e.target; // name="title" or "content"
    setDocument((prev) => ({ ...prev, [name]: value }));

    // Emit update to server
    socket.emit("update_doc", {
      id: `${id}/${index}`,
      data: { ...document, [name]: value, doc_type: docType },
    });
  };

  async function checkCookies() {
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
      const documentFetchedData = await documentsObject.fetchDocumentByID(
        id,
        index
      );
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
    socket.emit("join_room", { id: id, index: index });

    const handleUpdate = (update) => {
      setDocument(update);
    };

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
      <div className="container py-5">
        <div className="bg-white shadow-lg rounded-4 p-4">
          <h1 className="fw-bold mb-4 text-primary">{document.title} </h1>

          <div className="row g-4">
            {/* Left Side - Editor Form */}
            <div className="col-md-6">
              {document && (
                <form
                  onSubmit={handleSubmitButton}
                  className="bg-light p-4 rounded-4 shadow-sm"
                >
                  <ToolBar
                    handleCancelButton={handleCancelButton}
                    handleShareDocument={handleShareDocument}
                    handleEditorState={handleEditorState}
                    editorString={editorString}
                    handleExecuteCode={handleExecuteCode}
                    editorState={editorState}
                  />

                  {/* Title Input */}
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      className="form-control rounded-3"
                      placeholder="Titel"
                      value={document.title || ""}
                      onChange={handleChange}
                    />
                    <label htmlFor="title">Titel</label>
                  </div>

                  {/* Content / Editor */}
                  <div className="form-floating mb-3">
                    {editorState ? (
                      <CodeEditor
                        value={document.content || ""}
                        name="editor"
                        id="editor"
                        className="form-control rounded-3"
                        onChange={handleChangeEditor}
                      />
                    ) : (
                      <textarea
                        name="content"
                        id="content"
                        className="form-control rounded-3"
                        placeholder="Innehåll"
                        rows="12"
                        value={document.content || ""}
                        onChange={handleChange}
                        style={{ minHeight: "300px" }}
                      />
                    )}
                    <label htmlFor="content">Innehåll</label>
                  </div>

                  {editorState && (
                    <div className="form-group">
                      <p className="text-muted">{codeResponse}</p>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Right Side - Secondary Box */}
            <div className="col-md-6">
              <div className="bg-secondary text-white rounded-4 p-4 h-100 d-flex align-items-center justify-content-center shadow-sm">
                <p className="fs-5 fw-semibold m-0">Right Side Box</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DocInfo;
