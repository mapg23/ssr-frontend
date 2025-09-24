const documentURL = import.meta.env.VITE_DOC_URL

const documentsObject = {
    fetchDocuments: async function () {
        try {
            const response = await fetch(`${documentURL}`);

            const data = await response.json();

            console.log("data", data);
            return data; //Results object.
        } catch (error) {
            console.error(`fetchDocuments error in document.js model ${error}`)
            return null;
        }
    },

    fetchDocumentByID: async function (id) {
        try {
            const response = await fetch(`${documentURL}${id}`);

            const data = await response.json();

            console.log("data", data);
            return data; //Results object.
        } catch (error) {
            console.error(`fetchDocumentByID error in document.js model ${error}`)
            return null;
        }
    }
};

export default documentsObject;
