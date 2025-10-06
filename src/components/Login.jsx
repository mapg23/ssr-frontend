// src/components/Register.jsx
import documentsObject from "../models/document.js";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Login() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleRegisterButton = () => {
    navigate("/ssr-frontend/register");
  };

  const handleSumbition = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const createUserObject = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    console.log(createUserObject);

    await documentsObject.LoginNewUser(createUserObject);
    navigate("/ssr-frontend/");
  };

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card p-4 shadow">
          <h3 className="text-center mb-4">Login</h3>
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
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
          <hr />
          <label
            className="form-check-label text-center w-100"
            htmlFor="loginButton"
          >
            Dont have an account?
          </label>
          <button
            type="submit"
            className="btn btn-secondary w-100"
            onClick={handleRegisterButton}
          >
            Register
          </button>
        </div>
      </div>
    </>
  );
}

export default Login;
