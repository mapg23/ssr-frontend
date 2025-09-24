// import Message from "./Message";
// import DocsList from "./components/DocsList";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RefactoredDocsList from "./components/RefactoredDocsList";
import DocInfo from "./components/DocInfo";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<RefactoredDocsList/>}/>
          <Route path="/:id" element={<DocInfo/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
