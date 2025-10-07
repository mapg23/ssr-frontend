// src/components/Register.jsx
import documentsObject from "../models/document.js";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ShareDocument() {
  const { id, index } = useParams();
  const navigate = useNavigate();

  const handleCancelButton = () => {
    navigate(`/ssr-frontend/${id}/${index}`);
  };
  
  const handleSumbition = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const createUserObject = {
      email: formData.get("email"),
    };

    console.log(`id: ${id}, index: ${index}, obj: ${createUserObject}`);
    await documentsObject.shareDocument(id, index, createUserObject);
    navigate(`/ssr-frontend/${id}/${index}`);
  };

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card p-4 shadow">
          <h3 className="text-center mb-4">Dela dokument</h3>
          <form onSubmit={handleSumbition}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                id="email"
                placeholder="Enter email to share"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Dela
            </button>
          </form>
          <hr />
            <button type="submit" className="btn btn-secondary w-100" onClick={handleCancelButton}>
              Avbryt
            </button>
        </div>
      </div>
    </>
  );
}

export default ShareDocument;
