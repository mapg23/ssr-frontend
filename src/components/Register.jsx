// src/components/Register.jsx
import documentsObject from "../models/document.js";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Register() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleLoginButton = () => {
    navigate("/ssr-frontend/login");
  };

  const handleSumbition = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const createUserObject = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    await documentsObject.createNewUser(createUserObject);
    navigate("/ssr-frontend/");
  };

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card p-4 shadow">
          <h3 className="text-center mb-4">Register</h3>
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
                placeholder="Enter email"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Full name
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                id="name"
                placeholder="Enter Full name"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                name="password"
                id="password"
                placeholder="Password"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Register
            </button>
          </form>
          <hr />
          <label
            className="form-check-label text-center w-100"
            htmlFor="loginButton"
          >
            Already have an account?
          </label>
          <button
            type="submit"
            className="btn btn-secondary w-100"
            onClick={handleLoginButton}
          >
            Login
          </button>
        </div>
      </div>
    </>
  );
}

export default Register;
