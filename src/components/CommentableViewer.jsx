// src/components/CommentableViewer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/** Split text by comment ranges and wrap with <mark> */
function renderWithHighlights(text, comments) {
  if (!text) return null;
  const ranges = [...(comments || [])]
    .filter(c => Number.isFinite(c.start) && Number.isFinite(c.end) && c.start < c.end)
    .sort((a, b) => a.start - b.start);

  const nodes = [];
  let i = 0;
  for (const c of ranges) {
    const s = Math.max(0, Math.min(c.start, text.length));
    const e = Math.max(0, Math.min(c.end, text.length));
    if (i < s) nodes.push(<span key={`t-${i}`}>{text.slice(i, s)}</span>);
    nodes.push(
      <mark
        key={`c-${c.id}`}
        data-comment-id={c.id}
        title={c.note}
        style={{ background: "rgba(255,235,59,0.6)", padding: 0 }}
      >
        {text.slice(s, e)}
      </mark>
    );
    i = e;
  }
  if (i < text.length) nodes.push(<span key={`t-end`}>{text.slice(i)}</span>);
  return nodes;
}

/** DOM Range → {start,end} offsets within container text. */
function rangeToOffsets(containerEl, range) {
  const textNodes = [];
  (function walk(n) {
    if (n.nodeType === Node.TEXT_NODE) textNodes.push(n);
    else n.childNodes && Array.from(n.childNodes).forEach(walk);
  })(containerEl);

  let pos = 0; let start = null; let end = null;
  for (const tn of textNodes) {
    if (tn === range.startContainer) start = pos + range.startOffset;
    if (tn === range.endContainer)   end   = pos + range.endOffset;
    pos += tn.nodeValue.length;
  }
  if (start == null || end == null) return null;
  return { start, end };
}

/** Small inline form under the icon */
function QuickCommentForm({ initial, onSubmit, onCancel }) {
  const [val, setVal] = useState(initial || "");
  return (
    <div
      style={{
        position: "fixed",
        top: initial.rectTop + 36,
        left: initial.rectLeft,
        background: "#111",
        color: "#fff",
        padding: "8px 10px",
        borderRadius: 8,
        boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
        zIndex: 10001,
        maxWidth: 320
      }}
    >
      <div style={{ marginBottom: 6, fontSize: 12, opacity: 0.8 }}>
        {initial.preview}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          autoFocus
          placeholder="Write a comment"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
          style={{
            flex: 1,
            borderRadius: 6,
            border: "1px solid #333",
            padding: "6px 8px",
            background: "#1b1b1b",
            color: "white",
            outline: "none"
          }}
        />
        <button
          onClick={() => val.trim() && onSubmit(val.trim())}
          style={{ padding: "6px 10px", borderRadius: 6 }}
        >
          Add
        </button>
        <button onClick={onCancel} style={{ padding: "6px 10px", borderRadius: 6 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function CommentableViewer({
  text,
  comments,
  onAddComment, // ({id, start, end, note}) => void
}) {
  const ref = useRef(null);

  const [bubble, setBubble] = useState(null);
  // bubble = { start, end, rectTop, rectLeft, preview }

  const [showForm, setShowForm] = useState(false);

  const rendered = useMemo(
    () => renderWithHighlights(text || "", comments || []),
    [text, comments]
  );

  function selectionInside(el) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return null;
    return range;
  }

  function updateSelectionUI() {
    const el = ref.current;
    if (!el) return setBubble(null);

    const range = selectionInside(el);
    if (!range) { setBubble(null); return; }

    const offsets = rangeToOffsets(el, range);
    if (!offsets || offsets.start === offsets.end) { setBubble(null); return; }

    const rect = range.getBoundingClientRect();
    const preview = (text || "").slice(offsets.start, offsets.end);
    setBubble({
      start: offsets.start,
      end: offsets.end,
      rectTop: rect.bottom + 6,
      rectLeft: rect.left,
      preview: preview.length > 40 ? `${preview.slice(0, 40)}…` : preview,
    });
    setShowForm(false);
  }

  // Show icon when selection changes
  useEffect(() => {
    const handler = () => updateSelectionUI();
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Recalculate if user releases mouse (helps in some browsers)
  function onMouseUp() {
    updateSelectionUI();
  }

  function openForm() {
    if (!bubble) return;
    setShowForm(true);
  }

  function submit(note) {
    if (!bubble) return;
    const payload = {
      id: crypto.randomUUID(),
      start: bubble.start,
      end: bubble.end,
      note,
    };
    onAddComment?.(payload);
    // clear selection / UI
    window.getSelection()?.removeAllRanges();
    setShowForm(false);
    setBubble(null);
  }

  function cancelForm() {
    setShowForm(false);
    // keep selection bubble so user can try again
  }

  return (
    <div style={{ position: "relative" }}>
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
          lineHeight: 1.5,
          cursor: "text",
          userSelect: "text",
          maxWidth: 680
        }}
        onMouseUp={onMouseUp}
      >
        {rendered}
      </div>

      {/* Floating add-comment icon */}
      {bubble && !showForm && (
        <button
          onClick={openForm}
          aria-label="Add comment"
          title="Add comment"
          style={{
            position: "fixed",
            top: bubble.rectTop,
            left: bubble.rectLeft,
            zIndex: 10000,
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 999,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            cursor: "pointer"
          }}
        >
          {/* simple note icon (SVG) */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16l4-4h10a2 2 0 0 0 2-2V6z"/>
          </svg>
        </button>
      )}

      {/* Inline form for the comment */}
      {bubble && showForm && (
        <QuickCommentForm
          initial={{ rectTop: bubble.rectTop, rectLeft: bubble.rectLeft, preview: bubble.preview }}
          onSubmit={submit}
          onCancel={cancelForm}
        />
      )}
    </div>
  );
}
