import { useState, useRef } from "react";

function ContentEditable() {
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

export default ContentEditable;