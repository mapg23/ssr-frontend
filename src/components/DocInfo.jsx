// src/components/DocInfo.jsx
import documentsObject from "../models/document.js";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import CodeEditor from "./CodeEditor.jsx";
import { socket } from "../socket.js";

import ToolBar from "./ToolBar.jsx";
import DocumentRenderer from "./DocumentRenderer.jsx";

function DocInfo() {
  const [document, setDocument] = useState({});
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

const handleCommentsUpdate = () => {
  console.log("ARRAY: ", comments);
};

const removeComment = (idToRemove) => {
  setComments((prevComments) => {
    const updated = prevComments.filter((comment) => comment.id !== idToRemove);
    socket.emit("update_comments", {
      id: `${id}/${index}`,
      data: updated,
    });
    return updated;
  });

  // cleanup highlight
  const span = window.document.querySelector(`span[data-id="${idToRemove}"]`);
  if (span) span.replaceWith(window.document.createTextNode(span.textContent));
};

const handleEditorState = () => {
  const contentDiv = window.document.getElementById("content");

  // Save the contentEditable’s HTML before switching away
  if (contentDiv && !editorState) {
    setDocument((prev) => ({
      ...prev,
      content: contentDiv.innerHTML,
    }));
  }

  setEditorState((prev) => !prev);
};


  const handleExecuteCode = async () => {
    let data = { code: btoa(document.content) };
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
    const { name, value } = e.target;
    setDocument((prev) => ({ ...prev, [name]: value }));

    socket.emit("update_doc", {
      id: `${id}/${index}`,
      data: { ...document, [name]: value, doc_type: docType },
    });
  };

  async function checkCookies() {
    const cookies = await documentsObject.checkCookies();
    if (!cookies.authorized) {
      navigate("/ssr-frontend/login");
      return;
    }
  }

  async function loadDocInfo() {
    try {
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
    socket.emit("join_room", { id: id, index: index });

    const handleUpdate = (update) => {
      setDocument(update);
    };

    const handleCommentUpdate = (update) => {
      setComments(update);
    };

    socket.on("doc_updated", handleUpdate);
    socket.on("comments_updated", handleCommentUpdate);
    // Cleanup
    return () => {
      socket.off("doc_updated", handleUpdate);
      socket.off("comments_updated", handleCommentUpdate);
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
          <h1 className="fw-bold mb-4 text-primary">{document.title}</h1>

          <div className="row g-4">
            <div className="col-md-6">
              {document && (
                <form
                  onSubmit={handleSubmitButton}
                  className="bg-white border shadow-sm p-3 mb-4 gap-3 p-4 h-100 shadow-sm"
                >
                  <ToolBar
                    handleCancelButton={handleCancelButton}
                    handleShareDocument={handleShareDocument}
                    handleEditorState={handleEditorState}
                    editorString={editorString}
                    handleExecuteCode={handleExecuteCode}
                    editorState={editorState}
                  />

                  <DocumentRenderer
                    document={document}
                    handleChange={handleChange}
                    editorState={editorState}
                    handleChangeEditor={handleChangeEditor}
                    comments={comments}
                    setComments={setComments}
                    handleCommentsUpdate={handleCommentsUpdate}
                    id={id}
                    index={index}
                  />
                </form>
              )}
            </div>

            {/* Right Side - Comments & Code Output */}
            <div className="col-md-6">
              <div className="bg-white border shadow-sm p-3 mb-4 gap-3 p-4 h-100 shadow-sm">
                {editorState && (
                  <div className="bg-white border shadow-sm p-3 mb-4">
                    <p className="mb-0 text-break"> &gt; {codeResponse}</p>
                  </div>
                )}

                {/* Comments Section */}
                <div className="d-flex flex-column gap-3">
                  {comments && comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <div
                        key={index}
                        className="bg-light text-dark rounded-3 p-3 shadow-sm"
                      >
                        <p className="mb-0">{comment.text}</p>
                        {comment.note && <p className="mb-0">{comment.note}</p>}

                      <button
                        className="btn btn-outline-secondary  toolbar-btn shadow-sm"
                        onClick={() => removeComment(comment.id)}
                      >
                        <i className="bi bi-save me-2"></i> Ta bort
                      </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No comments yet.</p>
                  )}
                </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DocInfo;
