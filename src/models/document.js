const documentURL = import.meta.env.VITE_DOC_URL

const documentsObject = {
    fetchDocuments: async function () {
        try {
            const response = await fetch(`${documentURL}`);

            const data = await response.json();

            return data; //Results object.
        } catch (error) {
            console.error(`Fetching error in document.js model ${error}`)
            return null;
        }
    }
};

export default documentsObject;
