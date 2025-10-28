import { useState, useEffect, useRef } from "react";
import CodeEditor from "./CodeEditor";

import { socket } from "../socket";

function DocumentRenderer({
  comments,
  setComments,
  document,
  handleChange,
  editorState,
  handleChangeEditor,
  handleCommentsUpdate,
  id,
  index,
}) {
  const contentRef = useRef(null);
  const selectionTimer = useRef(null);

  const [popover, setPopover] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  const [prompt, setPrompt] = useState({
    visible: false,
    text: "",
    range: null,
    selectedText: "",
  });

  const UpdateDocument = () => {
    if (contentRef.current) {
      handleChange({
        target: {
          name: "content",
          value: contentRef.current.innerHTML,
        },
      });
    }
  };

  const handleSaveComment = (e) => {
    e?.preventDefault();
    const note = (prompt.text || "").trim();
    if (
      !note ||
      !prompt.range ||
      prompt.range.collapsed ||
      !prompt.selectedText?.trim()
    ) {
      return;
    }

    const commentId = crypto.randomUUID();

    // Build span wrapper for the selection
    const span = window.document.createElement("span");
    span.style.backgroundColor = "#ffeb3b";
    span.style.cursor = "pointer";
    span.dataset.id = commentId;
    span.dataset.comment = note; // store the typed comment
    span.title = note; // native tooltip

    const range = prompt.range.cloneRange();
    const contents = range.extractContents();
    span.appendChild(contents);
    range.insertNode(span);

    // Place caret after the inserted span
    const zwsp = window.document.createTextNode("\u200B");
    span.parentNode.insertBefore(zwsp, span.nextSibling);
    const sel = window.getSelection();
    const after = window.document.createRange();
    after.setStartAfter(zwsp);
    after.collapse(true);
    sel.removeAllRanges();
    sel.addRange(after);

    // Update comments state + broadcast
    setComments((prev) => {
      const comments = [
        ...prev,
        {
          id: commentId,
          text: note,
          selectedText: span.textContent,
          color: "#ffeb3b",
        },
      ];
      socket.emit("update_comments", {
        id: `${id}/${index}`,
        data: { comments },
      });
      return comments;
    });

    // Persist updated HTML upstream
    if (contentRef.current) {
      handleChange({
        target: { name: "content", value: contentRef.current.innerHTML },
      });
    }

    // Reset prompt
    setPrompt({ visible: false, text: "", range: null, selectedText: "" });
  };

  const handleIconClick = (event) => {
    event.preventDefault();

    const selected = window.getSelection();
    if (!selected.rangeCount) {
      return;
    }

    const selectedText = selected.toString();
    const range = selected.getRangeAt(0);

    if (
      range.collapsed ||
      !contentRef.current?.contains(range.commonAncestorContainer) ||
      !selected.toString().trim()
    ) {
      return;
    }

    setPrompt({
      visible: true,
      text: "", // Clear any old text
      range: range,
      selectedText: selectedText,
    });
    setPopover({ visible: false, x: 0, y: 0 });
    console.log("icon clicked");
  };

  const handleSelection = () => {
    if (selectionTimer.current) {
      clearTimeout(selectionTimer.current);
    }
    selectionTimer.current = setTimeout(() => {
      const selectedText = window.getSelection();

      if (!selectedText.rangeCount) {
        setPopover({ visible: false, x: 0, y: 0 });
        return;
      }

      if (contentRef.current) {
        const selectedTextString = selectedText.toString();

        console.log("User is selecting:", selectedTextString);
        const range = selectedText.getRangeAt(0);

        const rect = range.getBoundingClientRect();

        setPopover({
          visible: true,
          x: rect.x + rect.width / 2, // Center of the selection
          y: rect.y, // Top of the selection
        });
      }
    }, 150);
  };

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    // Find all spans that represent comments
    const spanElements = contentRef.current.querySelectorAll("span[data-id]");

    const restoredComments = Array.from(spanElements).map((span) => ({
      id: span.dataset.id,
      text: span.dataset.comment || span.textContent,
      color: span.style.backgroundColor || "#ffeb3b",
    }));

    // Restore comments into state
    if (restoredComments.length > 0) {
      console.log("setting comments 1.");
      setComments(restoredComments);
    }

    console.log("Restored comments:", restoredComments);
  }, []);

  useEffect(() => {
    if (comments.length > 0) {
      handleCommentsUpdate();
    }
  }, [comments]);

  useEffect(() => {
    if (!contentRef.current || editorState) return;

    const current = contentRef.current.innerHTML;
    if (document.content && current !== document.content) {
      contentRef.current.innerHTML = document.content;
    }
  }, [document.content, editorState]);

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }
    window.document.addEventListener("selectionchange", handleSelection);

    return () => {
      window.document.removeEventListener("selectionchange", handleSelection);
      if (selectionTimer.current) {
        clearTimeout(selectionTimer.current);
      }
    };
  }, []);

  return (
    <>
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
          <>
            <div
              id="content"
              name="content"
              className="form-control rounded-3"
              contentEditable
              suppressContentEditableWarning
              ref={contentRef} //ref is just React's safe & reliable way of giving you the DOM object.
              onInput={() => UpdateDocument()}
              style={{
                minHeight: "300px",
                overflowY: "auto",
              }}
            />
            <label htmlFor="content">Innehåll</label>

            {popover.visible && (
              <div
                style={{
                  position: "fixed",
                  left: `${popover.x}px`,
                  top: `${popover.y}px`,
                  transform: "translate(-50%, -110%)",
                  backgroundColor: "#333",
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  zIndex: 1000,
                  cursor: "pointer",
                }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleIconClick}
              >
                Add Comment! 💬
              </div>
            )}

            {prompt.visible && (
              <div
                style={{
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  padding: "20px",
                  zIndex: 2000,
                  width: "300px",
                }}
              >
                <h5 style={{ marginTop: 0 }}>Add Comment</h5>
                <textarea
                  value={prompt.text}
                  onChange={(e) =>
                    setPrompt((p) => ({ ...p, text: e.target.value }))
                  }
                  autoFocus
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    boxSizing: "border-box",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "15px",
                  }}
                >
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      setPrompt({
                        visible: false,
                        text: "",
                        range: null,
                        selectedText: "",
                      })
                    }
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSaveComment()}
                    disabled={
                      !prompt.text?.trim() ||
                      !prompt.range ||
                      (prompt.range && prompt.range.collapsed) ||
                      !prompt.selectedText?.trim()
                    }
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default DocumentRenderer;
