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

type ListDataStoresResponse = {
    datastores: DataStoreInfo[],
    nextPageCursor: string
}

export default class OpenCloud extends APIRequest {
    public constructor(apiKey: string, private universeID: number) {
        super(apiKey);
    };

    public getDataStore(name: string) {
        return new DataStore(this.apiKey, this.universeID, name);
    }

    public async listDataStores(limit: number = 50, cursor?: string, prefix?: string): Promise<DataStoreResponse<ListDataStoresResponse>> {
        let response = await this.makeRequest("https://apis.roblox.com/datastores/v1/universes/" + this.universeID + "/standard-datastores", { cursor, prefix, limit }, {
            method: "GET"
        });

        if (response.statusCode >= 200 && response.statusCode < 300) {
            return {
                value: this.fromJSON(await response.body.text()),
                headers: response.headers,
                statusCode: response.statusCode
            };
        } else if (response.statusCode == 502) {
            throw new OpenCloudError("Bad Gateway", "INTERNAL", "Unknown");
        } else {
            let errorData = await response.body.json();
            throw new OpenCloudError(errorData.message, errorData.error, errorData.errorDetails[0].datastoreErrorCode);
        }
    }
}
