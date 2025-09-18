import { useState, useEffect } from "react";

function RefactoredDocsList() {
  const [documents, setDocuments] = useState([]);

  if (documents) {
      console.log(documents);
  };

  useEffect(() => {
    try {
      fetch("")
        .then((res) => res.json())
        .then((data) => setDocuments(data["data"]["result"]));
    } catch (error) {
        console.error(error)
    }
  }, []);

  if (!documents) {
    return <p>Loading documents...</p>
  };

  return (
    <>
      <h1>Documents</h1>
      <ul className="list-group">
        {documents.map((item) => (
          <li
            key={item._id}
            className="list-group-item"
            onClick={() => console.log(item)}
          >
            <a href="">{item.name}</a>
          </li>
        ))}
      </ul>
    </>
  );
}

export default RefactoredDocsList;
