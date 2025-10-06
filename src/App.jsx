// import Message from "./Message";
// import DocsList from "./components/DocsList";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RefactoredDocsList from "./components/RefactoredDocsList";
import DocInfo from "./components/DocInfo";
import CreateNewDoc from "./components/CreateNewDoc";
import Register from "./components/Register";
import Login from "./components/Login";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/ssr-frontend/" element={<RefactoredDocsList />} />
          <Route path="/ssr-frontend/:id/:index" element={<DocInfo />} />
          <Route path="/ssr-frontend/create-doc" element={<CreateNewDoc />} />
          <Route path="/ssr-frontend/register" element={<Register />} />
          <Route path="/ssr-frontend/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
