import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RefactoredDocsList from "./components/RefactoredDocsList";
import DocInfo from "./components/DocInfo";
import CreateNewDoc from "./components/CreateNewDoc";
import Register from "./components/Register";
import Login from "./components/Login";
import ShareDocument from "./components/shareDocument";

import { useState, useEffect } from "react";

import { socket } from './socket';
// import { io } from 'socket.io-client';

// let socket;
function App() {
  useEffect(() => {
    // socket = io("http://localhost:8080");
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/ssr-frontend/" element={<RefactoredDocsList />} />
          <Route path="/ssr-frontend/:id/:index" element={<DocInfo />} />
          <Route path="/ssr-frontend/create-doc" element={<CreateNewDoc />} />
          <Route path="/ssr-frontend/register" element={<Register />} />
          <Route path="/ssr-frontend/login" element={<Login />} />
          <Route path="/ssr-frontend/share-document/:id/:index" element={<ShareDocument />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
