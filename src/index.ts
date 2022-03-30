import OpenCloud from "./OpenCloud";
import { OpenCloudError } from "./OpenCloud/Errors";

const API_KEY = "";

let openCloud = new OpenCloud(API_KEY, 3407804942);
let dataStore = openCloud.getDataStore("Test");

(async () => {
    try {
        // Set a value
        await dataStore.set("Test", 1);

        // Get a value
        let { value } = await dataStore.get("Test");
        console.log(value);

        // Increment a value
        let { value: newValue } = await dataStore.increment("Test", 1);
        console.log(newValue);

        // List all data stores
        let { value: dataStores } = await openCloud.listDataStores();
        console.log(dataStores);

        // List entries
        let { value: entries } = await dataStore.listEntries();
        console.log(entries);

        // List versions
        let { value: versions } = await dataStore.listVersions("Test", undefined, "Ascending");
        console.log(versions);

        // Get a version
        let { value: version } = await dataStore.getVersion("Test", versions.versions[0].version);
        console.log(version);

        // Delete a value
        await dataStore.delete("Test");

        // Get a value
        let { value: deletedValue } = await dataStore.get("Test");
        console.log(deletedValue);
    } catch (exception) {
        if (exception instanceof OpenCloudError) {
            console.log(exception);
        }
    }
})();