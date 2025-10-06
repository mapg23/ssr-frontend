const documentURL = import.meta.env.VITE_DOC_URL

const documentsObject = {

    checkCookies: async function () {
        try {
            const response = await fetch(`${documentURL}check-cookies`, { credentials: 'include'});
            const data = await response.json();

            return data;
        } catch (err) {
            console.error("Failed to check if cookies is authorized");
            return null;
        }
    },

    fetchDocuments: async function () {
        try {
            const response = await fetch(`${documentURL}`, { credentials: 'include' });

            const data = await response.json();

            // console.log("fetchDocuments data", data);
            return data;
        } catch (error) {
            console.error(`fetchDocuments error in document.js model ${error}`)
            return null;
        }
    },

    fetchDocumentByID: async function (id, index) {
        try {
            const response = await fetch(`${documentURL}${id}/${index}`, { credentials: 'include' });

            const data = await response.json();

            // console.log("fetchDocumentByID data", data);
            return data;
        } catch (error) {
            console.error(`fetchDocumentByID error in document.js model ${error}`)
            return null;
        }
    },

    updateDocumentByID: async function (id, index, updatedDoc) {
        try {
            const docURL = `${documentURL}update/${id}/${index}`;

            const response = await fetch(docURL, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedDoc)
            });

            if (!response.ok) {
                throw new Error(`Failed to update document: ${response.statusText}`);
            };
            const data = await response.json();

            return data;
        } catch (error) {
            console.error(`fetchDocumentByID error in document.js model ${error}`)
            return null;
        }
    },

    createNewUser: async function (userObject) {
        try {
            const docURL = `${documentURL}register`;
            const response = await fetch(docURL, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userObject)
            });

            if(!response.ok) {
                throw new Error('Falied to create User');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Register error in document.js model ${error}`);
            return null;
        } 
    },

    LoginNewUser: async function (userObject) {
        try {
            const docURL = `${documentURL}login`;
            const response = await fetch(docURL, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userObject)
            });

            if(!response.ok) {
                throw new Error('Falied to login User');
            }
            const data = await response.json();

            return data;
        } catch (error) {
            console.error(`Register error in document.js model ${error}`);
            return null;
        } 
    },

    createNewDoc: async function (updatedDoc) {
        try {
            const docURL = `${documentURL}`;

            const response = await fetch(docURL, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedDoc)
            });

            if (!response.ok) {
                throw new Error(`Failed to create document: ${response.statusText}`);
            };
            const data = await response.json();

            return data;
        } catch (error) {
            console.error(`createNewDoc error in document.js model ${error}`)
            return null;
        }
    }
};

export default documentsObject;
