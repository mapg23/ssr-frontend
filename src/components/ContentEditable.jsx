import React, { useState, useRef } from "react";

export default function EditableHighlighter() {
  const [html, setHtml] = useState("Highlight some text here");
  const ref = useRef(null);

  const highlightSelection = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement("mark");
    range.surroundContents(span);
    setHtml(ref.current.innerHTML);
  };

  return (
    <div className="max-w-md mx-auto">
      <button
        onClick={highlightSelection}
        className="mb-2 px-3 py-1 bg-blue-500 text-white rounded"
      >
        Highlight selection
      </button>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="border p-2 rounded min-h-[100px]"
        dangerouslySetInnerHTML={{ __html: html }}
        onInput={(e) => setHtml(e.currentTarget.innerHTML)}
      />
    </div>
  );
}
