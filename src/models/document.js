const documentURL = import.meta.env.VITE_DOC_URL

const documentsObject = {
    fetchDocuments: async function () {
        try {
            const response = await fetch(`${documentURL}`);

            const data = await response.json();

            // console.log("fetchDocuments data", data);
            return data;
        } catch (error) {
            console.error(`fetchDocuments error in document.js model ${error}`)
            return null;
        }
    },

    fetchDocumentByID: async function (id) {
        try {
            const response = await fetch(`${documentURL}${id}`);

            const data = await response.json();

            // console.log("fetchDocumentByID data", data);
            return data;
        } catch (error) {
            console.error(`fetchDocumentByID error in document.js model ${error}`)
            return null;
        }
    },

    updateDocumentByID: async function (id, updatedDoc) {
        try {
            const docURL = `${documentURL}update/${id}`;

            // console.log("docURL", docURL);
            const response = await fetch(docURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedDoc)
            });

            if (!response.ok) {
                throw new Error(`Failed to update document: ${response.statusText}`);
            };
            const data = await response.json();

            // console.log("updateDocumentByID data", data);
            return data;
        } catch (error) {
            console.error(`fetchDocumentByID error in document.js model ${error}`)
            return null;
        }
    },

    createNewDoc: async function (updatedDoc) {
        try {
            const docURL = `${documentURL}`;

            // console.log("docURL", docURL); 
            const response = await fetch(docURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedDoc)
            });

            if (!response.ok) {
                throw new Error(`Failed to create document: ${response.statusText}`);
            };
            const data = await response.json();

            // console.log("createNewDoc data", data);
            return data;
        } catch (error) {
            console.error(`createNewDoc error in document.js model ${error}`)
            return null;
        }
    }
};

export default documentsObject;
