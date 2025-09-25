// src/components/DocInfo.jsx
import documentsObject from "../models/document.js"
import { useNavigate } from 'react-router-dom';

function DocInfo() {
  const navigate = useNavigate();

  const handleSubmitButton = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const createDocObject = {
        title: formData.get("title"),
        content: formData.get("content"),
    };

    await documentsObject.createNewDoc(createDocObject);
    navigate('/ssr-frontend/');
  }

  return (
    <>
      <div className="container mt-4">
        <div className="col-md-6">
          {document && (
            <form onSubmit={handleSubmitButton}>
              <div className="form-group mb-3">
                <label htmlFor="title">Titel</label>
                <input 
                  type="text"
                  name="title"
                  id="title"
                  className = "form-control"
                /><br></br>
              </div>
              <div className="form-group">
                <label htmlFor="content">Innehåll</label>
                <textarea
                  name="content"
                  id="content"
                  className = "form-control"
                />
              </div>

              <button
                className="btn btn-primary me-md-2"
                type="submit"
              >Skapa ny dokument</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default DocInfo;