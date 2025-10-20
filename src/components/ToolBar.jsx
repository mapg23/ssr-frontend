function ToolBar({
  handleCancelButton,
  handleShareDocument,
  handleEditorState,
  editorString,
  handleExecuteCode,
  editorState,
}) {
  return (
    <div className="toolbar-container d-flex flex-row flex-wrap align-items-center justify-content-center bg-white border shadow-sm p-3 mb-4 gap-3 rounded-4">
      <button
        className="btn btn-outline-secondary  toolbar-btn shadow-sm"
        type="submit"
      >
        <i className="bi bi-save me-2"></i> Uppdatera
      </button>

      <button
        className="btn btn-outline-secondary  toolbar-btn shadow-sm"
        type="button"
        onClick={handleCancelButton}
      >
        <i className="bi bi-x-circle me-2"></i> Avbryt
      </button>

      <button
        className="btn btn-outline-secondary  toolbar-btn shadow-sm"
        type="button"
        onClick={handleShareDocument}
      >
        <i className="bi bi-share me-2"></i> Dela
      </button>

      <button
        className="btn btn-outline-secondary  toolbar-btn shadow-sm"
        type="button"
        onClick={handleEditorState}
      >
        <i className="bi bi-toggle2-on me-2"></i> Switch to{" "}
        {String(editorString)}
      </button>

      {editorState && (
        <button
          className="btn btn-outline-secondary  toolbar-btn shadow-sm"
          type="button"
          onClick={handleExecuteCode}
        >
          <i className="bi bi-play-fill me-2"></i> Exekvera kod
        </button>
      )}
    </div>
  );
}

export default ToolBar;
