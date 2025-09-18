import { baseURL } from "../utils.js";

const documents = {
    fetchDocuments: async function getDelayedTrains() {
        const response = await fetch(`${baseURL}/delayed`);

        const result = await response.json();

        return result.data;
    }
};

export default documents;
