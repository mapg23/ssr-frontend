import { useState, useEffect } from "react";

function DocsList() {
  const [documents, setDocuments] = useState(null); // null = not loaded yet

  console.log(documents);

  useEffect(() => {
    fetch("http://localhost:8080/")
      .then((res) => res.json())
      .then((data) => setDocuments(data["data"]["result"]));
  }, []);

  if (!documents) return <p>Loading documents...</p>; // show before rendering the list

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

export default DocsList;
