// import Message from "./Message";
// import DocsList from "./components/DocsList";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RefactoredDocsList from "./components/RefactoredDocsList";
import DocInfo from "./components/DocInfo";
import CreateNewDoc from "./components/CreateNewDoc";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/ssr-frontend/" element={<RefactoredDocsList/>}/>
          <Route path="/ssr-frontend/:id" element={<DocInfo/>}/>
          <Route path="/ssr-frontend/create-doc" element={<CreateNewDoc/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
