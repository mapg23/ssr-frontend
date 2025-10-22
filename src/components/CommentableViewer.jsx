// src/components/CommentableViewer.jsx
import { useEffect, useMemo, useRef } from "react";


function getSelectionRect() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  return { top: rect.top + window.scrollY, left: rect.left + window.scrollX };
}

// const rect = getSelectionRect();
// onSelectRange?.({ start, end, rect }); // include rect so we can place the popover


function renderWithHighlights(text, comments) {
  if (!text) return null;

  // accept only finite ranges; sort by start
  const ranges = [...(comments || [])]
    .filter(c => Number.isFinite(c.start) && Number.isFinite(c.end) && c.start < c.end)
    .sort((a, b) => a.start - b.start);

  const parts = [];
  let i = 0;

  for (const c of ranges) {
    // clamp to text bounds
    let s = Math.max(0, Math.min(c.start, text.length));
    let e = Math.max(0, Math.min(c.end,   text.length));

    // if the new range starts before we've rendered up to, clamp start to i (prevents overlap duplication)
    if (s < i) s = i;
    if (e <= s) continue; // empty after clamp

    if (i < s) parts.push(<span key={`t-${i}`}>{text.slice(i, s)}</span>);
    parts.push(
      <mark
        key={`c-${c.id ?? `${s}-${e}`}`}
        title={c.note ?? ""}
        style={{ background: "rgba(255,235,59,.6)", padding: 0 }}
      >
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

export default function CommentableViewer({ text, comments, onSelectRange }) {
  const ref = useRef(null);

  const rendered = useMemo(
    () => renderWithHighlights(text || "", comments || []),
    [text, comments]
  );

  function handleSelection() {
    const el = ref.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return;

    const off = rangeToOffsets(el, range);
    if (!off || off.start === off.end) return;

    onSelectRange?.(off); // parent will prompt, save, re-render highlights
  }

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div
      ref={ref}
      role="textbox"
      aria-label="Document viewer"
      contentEditable={false}
      style={{
        whiteSpace: "pre-wrap",
        border: "1px solid #444",
        borderRadius: 8,
        padding: 12,
        minHeight: 140,
        lineHeight: 1.5
      }}
      onMouseUp={handleSelection}
    >
      {rendered}
    </div>
  );
}
