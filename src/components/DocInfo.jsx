// src/components/DocInfo.jsx
import documentsObject from "../models/document.js";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import CodeEditor from "./CodeEditor.jsx";

import { socket } from "../socket.js";

import ToolBar from "./ToolBar.jsx";
import DocumentRenderer from "./DocumentRenderer.jsx";
import CommentableViewer from "./CommentableViewer.jsx";


function asDisplayString(value) {
  if (value == null) {
    return ""
  };
  if (typeof value === "string") {
    return value
  };
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function DocInfo() {
  const [document, setDocument] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id, index } = useParams();
  const navigate = useNavigate();

  // Editor variables
  const [editorState, setEditorState] = useState(false);
  const editorString = editorState ? "Document" : "Editor";
  const docType = editorState ? "js" : "doc";
  const [codeResponse, setCodeResponse] = useState("");
  const [comments, setComments] = useState([]);


async function persistComments(nextComments) {
  try {
    await documentsObject.updateDocumentByID(id, index, {
      title: document.title || "",
      content: document.content || "",
      comments: nextComments,
    });
  } catch (e) {
    console.error("Failed to persist comments:", e);
  }
}

function onAddCommentLocal(payload) {
  // optimistic UI
  setComments(prev => {
    const next = [...prev, payload];
    // fire-and-forget persistence
    persistComments(next);
    return next;
  });
  socket.emit("add_comment", payload);
}

  // This switches between editor and document;
  const handleEditorState = () => {
    setEditorState((prev) => !prev);
  };

  const handleExecuteCode = async () => {
    let data = {
      code: btoa(document.content || ""),
    };

    let res = await documentsObject.executeCode(data);

    console.log("res", res);
    setCodeResponse(asDisplayString(res));
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
      content: document.content || "",
      comments: comments
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
      const documentFetchedData = await documentsObject.fetchDocumentByID(id, index);
      if (documentFetchedData?.data) {
        const d = documentFetchedData.data;
        setDocument({
          title: asDisplayString(d.title) || "",
          content: typeof d.content === "string" ? d.content : asDisplayString(d.content),
        });
        setComments(Array.isArray(d.comments) ? d.comments : []);
      } else {
        setDocument({ title: "", content: "" });
        setComments([]);
      }
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function handleSockets() {
    socket.emit("join_room", { id: id, index: index });

    const handleUpdate = (update) => {
      const safe = update || {};
      setDocument({
        title: asDisplayString(safe.title) || "",
        content:
          typeof safe.content === "string" ? safe.content : asDisplayString(safe.content),
      });
      if (Array.isArray(safe.comments)) setComments(safe.comments);
    };

    const handleCommentAdded = (payload) => {
      setComments((prev) =>
        prev.some((c) => c.id === payload.clientId)
            ? prev
            : [
              ...prev,
              {
                docId: `${id}/${index}`,
                id: payload.clientId,
                note: payload.note,
                start: payload.start,
                end: payload.end,
                createdAt: payload.createdAt
              }
            ]
      );
    };

    socket.on("doc_updated", handleUpdate);
    socket.on("comment_added", handleCommentAdded);

    // Cleanup when leaving the page
    return () => {
      socket.off("doc_updated", handleUpdate);
      socket.off("comment_added", handleCommentAdded);
    };
  }

  useEffect(() => {
    checkCookies();
    loadDocInfo();
    const cleanup = handleSockets();

    return cleanup;
  }, [id, index]);

  if (loading) return <p>Loading doc's info...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <>
      <div className="container py-5">
        <div className="bg-white shadow-lg rounded-4 p-4">
          <h1 className="fw-bold mb-4 text-primary">{document.title} </h1>

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
                    {editorState ? (
                      <div className="form-floating mb-3">
                          <CodeEditor
                            value={document.content || ""}
                            name="editor"
                            id="editor"
                            className="form-control rounded-3"
                            onChange={handleChangeEditor}
                          />
                        <label htmlFor="editor">Innehåll</label>
                      </div>
                      ) : (
                      <div className="mb-3">
                        <label className="form-label d-block">Innehåll</label>
                        <CommentableViewer
                          text={document.content || ""}
                          comments={comments}
                          onSelectRange={({ start, end }) => {
                            const base = document.content || "";
                            const note = window.getSelection("Comment:", base.slice(start, end));
                            if (!note) {
                              return
                            };
                            const payload = { 
                              docId: `${id}/${index}`,
                              id: crypto.randomUUID(),
                              note,
                              start,
                              end
                            };

                            onAddCommentLocal(payload);
                          }}
                        />
                      </div>
                    )}

                  {editorState && !!codeResponse && (
                    <div className="form-group">
                      <pre className="text-muted">{codeResponse}</pre>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Right Side - Secondary Box */}
            <div className="col-md-6">
              <div className="bg-white border shadow-sm p-3 mb-4 gap-3 p-4 h-100 shadow-sm">
                {/* Code Response Box */}
                {editorState && !!codeResponse && (
                  <div className="bg-white border shadow-sm p-3 mb-4">
                    <pre className="mb-0 text-break">{codeResponse}</pre>
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
                        <p className="mb-0">{asDisplayString(comment?.note)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted fst-italic">No comments yet.</p>
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
