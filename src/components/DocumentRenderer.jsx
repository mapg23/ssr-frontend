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
  index
}) {
  const contentRef = useRef(null);

  const onChange = (event, handleChange, contentRef, setComments, id, index) => {
    event.preventDefault();

    const selected = window.getSelection();
    if (!selected.rangeCount) return;
    const selectedText = selected.toString();
    if (!selectedText.trim()) return;

    const range = selected.getRangeAt(0);
    const comment_id = Date.now(); // unique ID instead of index-based

    const span = window.document.createElement("span");
    span.textContent = selectedText;
    span.style.backgroundColor = "#ffeb3b";
    span.style.cursor = "pointer";
    span.dataset.id = comment_id;

    range.deleteContents();
    range.insertNode(span);
    selected.removeAllRanges();

    const space = window.document.createTextNode("\u200B");
    span.parentNode.insertBefore(space, span.nextSibling);

    const newRange = window.document.createRange();
    newRange.setStartAfter(space);
    newRange.collapse(true);
    selected.removeAllRanges();
    selected.addRange(newRange);

    if (contentRef.current) {
      handleChange({
        target: {
          name: "content",
          value: contentRef.current.innerHTML,
        },
      });
    }

    setTimeout(() => {
      setComments((prev) => {
        const updated = [
          ...prev,
          {
            id: comment_id,
            text: selectedText,
            start: range.startOffset,
            end: range.endOffset,
            color: "#ffeb3b",
          },
        ];

        socket.emit("update_comments", {
          id: `${id}/${index}`,
          data: updated,
        });

        return updated;
      });
    }, 0);
  };

  const UpdateDocument = () => {
    if (contentRef.current) {
      handleChange({
        target: {
          name: "content",
          value: contentRef.current.innerHTML,
        },
      });
    }
  }

  useEffect(() => {
    if (!contentRef.current) return;

    // Find all spans that represent comments
    const spanElements = contentRef.current.querySelectorAll("span[data-id]");

    const restoredComments = Array.from(spanElements).map((span) => ({
      id: Number(span.dataset.id),
      text: span.textContent,
      color: span.style.backgroundColor || "#ffeb3b",
    }));

    // Restore comments into state
    if (restoredComments.length > 0) {
      console.log("setting comments 1.")
      setComments(restoredComments);
    }

    console.log("Restored comments:", restoredComments);
  }, []);

  useEffect(() => {
    if(comments.length > 0) {
      handleCommentsUpdate();
    }
  }, [comments]);

  useEffect(() => {
    if (!contentRef.current) return;

    const current = contentRef.current.innerHTML;
    if (current !== document.content) {
      contentRef.current.innerHTML = document.content || "";
    }
  }, [document.content]);


  useEffect(() => {
    if (!contentRef.current) return;
    const current = contentRef.current.innerHTML;
    if (document.content && current !== document.content) {
      contentRef.current.innerHTML = document.content;
    }
  }, [document.content, editorState]);



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
            ref={contentRef}
            onContextMenu={(e) => onChange(e, handleChange, contentRef, setComments, id, index)}
            onInput={() => UpdateDocument()}
            style={{
              minHeight: "300px",
              overflowY: "auto",
            }}
          />
          <label htmlFor="content">Innehåll</label>
        </>
        )}
      </div>
    </>
  );
}

export default DocumentRenderer;
