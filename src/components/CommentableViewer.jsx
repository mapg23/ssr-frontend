// src/components/CommentableViewerLite.jsx
import React, { useEffect, useMemo, useRef } from "react";

/* 1) Render text with highlights */
function renderWithHighlights(text, comments) {
  if (!text) return null;
  const ranges = [...(comments || [])]
    .filter(c => Number.isFinite(c.start) && Number.isFinite(c.end) && c.start < c.end)
    .sort((a, b) => a.start - b.start);

  const parts = [];
  let i = 0;
  for (const c of ranges) {
    const s = Math.max(0, Math.min(c.start, text.length));
    const e = Math.max(0, Math.min(c.end, text.length));
    if (i < s) parts.push(<span key={`t-${i}`}>{text.slice(i, s)}</span>);
    parts.push(
      <mark key={`c-${c.id}`} title={c.note} style={{ background: "rgba(255,235,59,.6)", padding: 0 }}>
        {text.slice(s, e)}
      </mark>
    );
    i = e;
  }
  if (i < text.length) parts.push(<span key="t-end">{text.slice(i)}</span>);
  return parts;
}

/* 2) Convert DOM Range to character offsets within container */
function rangeToOffsets(containerEl, range) {
  const textNodes = [];
  (function walk(n) {
    if (n.nodeType === Node.TEXT_NODE) textNodes.push(n);
    else n.childNodes && Array.from(n.childNodes).forEach(walk);
  })(containerEl);

  let pos = 0, start = null, end = null;
  for (const tn of textNodes) {
    if (tn === range.startContainer) start = pos + range.startOffset;
    if (tn === range.endContainer)   end   = pos + range.endOffset;
    pos += tn.nodeValue.length;
  }
  return (start == null || end == null) ? null : { start, end };
}

export default function CommentableViewerLite({ text, comments, onSelectRange }) {
  const ref = useRef(null);
  const rendered = useMemo(() => renderWithHighlights(text || "", comments || []), [text, comments]);

  function handleSelection() {
    const el = ref.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return;

    const off = rangeToOffsets(el, range);
    if (!off || off.start === off.end) return;
    onSelectRange?.(off); // <-- hand offsets to parent
    sel.removeAllRanges(); // optional: clear selection
  }

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, [text]);

  return (
    <div
      ref={ref}
      role="textbox"
      aria-label="Document viewer"
      contentEditable={false}
      style={{ whiteSpace: "pre-wrap", border: "1px solid #444", borderRadius: 8, padding: 12, minHeight: 140 }}
      onMouseUp={handleSelection}
    >
      {rendered}
    </div>
  );
}
