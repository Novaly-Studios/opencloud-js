import { IncomingHttpHeaders } from "http2";
import APIRequest from "./APIRequest";
import DataStore from "./DataStore";
import { OpenCloudError } from "./Errors";

type DataStoreInfo = {
    name: string,
    createdTime: string
}

type DataStoreResponse<T> = {
    value: T,
    headers: IncomingHttpHeaders,
    statusCode: number
}

export default class OpenCloud extends APIRequest {
    public constructor(apiKey: string, private universeID: number) {
        super(apiKey);
    };

    public getDataStore(name: string) {
        return new DataStore(this.apiKey, this.universeID, name);
    }

    public async listDataStores(): Promise<DataStoreResponse<DataStoreInfo[]>> {
        let response = await this.makeRequest("https://apis.roblox.com/datastores/v1/universes/" + this.universeID + "/standard-datastores", {}, {
            method: "GET"
        });

        if (response.statusCode >= 200 && response.statusCode < 300) {
            return {
                value: this.fromJSON(await response.body.text()),
                headers: response.headers,
                statusCode: response.statusCode
            };
        } else {
            let errorData = await response.body.json();
            throw new OpenCloudError(errorData.message, errorData.error, errorData.errorDetails[0].datastoreErrorCode);
        }
    }
}
