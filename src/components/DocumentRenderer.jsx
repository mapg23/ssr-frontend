import CodeEditor from "./CodeEditor";

function DocumentRenderer({
  document,
  handleChange,
  editorState,
  handleChangeEditor,
}) {
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
            <textarea
              name="content"
              id="content"
              className="form-control rounded-3"
              placeholder="Innehåll"
              rows="12"
              value={document.content || ""}
              onChange={handleChange}
              style={{ minHeight: "300px" }}
            />
            <label htmlFor="content">Innehåll</label>
          </>
        )}
      </div>
    </>
  );
}

export default DocumentRenderer;
