import crypto from "crypto";
import { IncomingHttpHeaders } from "http2";
import lodash from "lodash";
import { Dispatcher, request } from "undici";
import APIRequest from "./APIRequest";
import { OpenCloudError } from "./Errors";

type EntryKeyInfo = {
    key: string,
    scope: string
}

type EntryVersionInfo = {
    version: string,
    deleted: boolean,
    createdTime: string,
    contentLength: number,
    objectCreatedTime: string
}

type DataStoreResponse<T> = {
    value: T,
    headers: IncomingHttpHeaders,
    statusCode: number
}

type EntryListResponse = DataStoreResponse<{
    keys: EntryKeyInfo[],
    nextPageCursor?: string
}>;

type VersionListResponse = DataStoreResponse<{
    versions: EntryVersionInfo[],
    nextPageCursor?: string
}>

export default class DataStore extends APIRequest {
    private baseURL: string;

    public constructor(apiKey: string, universeID: number, private dataStoreName: string) {
        super(apiKey);

        this.baseURL = "https://apis.roblox.com/datastores/v1/universes/" + universeID + "/standard-datastores/datastore/";
    }

    public async makeRequest(endpoint: string, params: { [key: string]: any } = {}, options: Partial<Dispatcher.RequestOptions> = {}) {
        return await super.makeRequest(this.baseURL + endpoint, lodash.merge({ datastoreName: this.dataStoreName }, params), options);
    }

    // Metadata endpoints

    public async listEntries(limit: number = 50, prefix?: string, cursor?: string): Promise<EntryListResponse> {
        let response = await this.makeRequest("entries", { limit, prefix, cursor, AllScopes: true }, {
            method: "GET"
        });

        if (response.statusCode >= 200 && response.statusCode < 300) {
            return {
                value: this.fromJSON(await response.body.text()),
                headers: response.headers,
                statusCode: response.statusCode
            };
        } if (response.statusCode == 502) {
            throw new OpenCloudError("Bad Gateway", "INTERNAL", "Unknown");
        } else {
            let errorData = await response.body.json();
            throw new OpenCloudError(errorData.message, errorData.error, errorData.errorDetails[0].datastoreErrorCode);
        }
    }

    // Data endpoints

    public async get(key: string): Promise<DataStoreResponse<any>> {
        let response = await this.makeRequest("entries/entry", { entryKey: key }, {
            method: "GET"
        });

        if (response.statusCode >= 200 && response.statusCode < 300) {
            return {
                value: this.fromJSON(await response.body.text()),
                headers: response.headers,
                statusCode: response.statusCode
            };
        } if (response.statusCode == 502) {
            throw new OpenCloudError("Bad Gateway", "INTERNAL", "Unknown");
        } else {
            let errorData = await response.body.json();
            throw new OpenCloudError(errorData.message, errorData.error, errorData.errorDetails[0].datastoreErrorCode);
        }
    }

    public async set(key: string, value: any, userIds: number[] = [], attributes: any = {}, matchVersion?: string, exclusiveCreate?: boolean): Promise<DataStoreResponse<EntryVersionInfo>> {
        let body = this.toJSON(value);
        let bodyHash = this.getHash(body);

        let response = await this.makeRequest("entries/entry", { entryKey: key, matchVersion, exclusiveCreate }, {
            method: "POST",
            body: body,
            headers: {
                "Content-MD5": bodyHash,
                "Content-Type": "application/json",

                "roblox-entry-userids": `[${userIds.join(",")}]`,
                "roblox-entry-attributes": JSON.stringify(attributes)
            }
        });

        if (response.statusCode >= 200 && response.statusCode < 300) {
            return {
                value: this.fromJSON(await response.body.text()),
                headers: response.headers,
                statusCode: response.statusCode
            };
        } if (response.statusCode == 502) {
            throw new OpenCloudError("Bad Gateway", "INTERNAL", "Unknown");
        } else {
            let errorData = await response.body.json();
            throw new OpenCloudError(errorData.message, errorData.error, errorData.errorDetails[0].datastoreErrorCode);
        }
    }

    public async increment(key: string, incrementBy: number = 1, userIds: number[] = [], attributes: any = {}): Promise<DataStoreResponse<number>> {
        let response = await this.makeRequest("entries/entry/increment", { entryKey: key, incrementBy }, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",

                "roblox-entry-userids": `[${userIds.join(",")}]`,
                "roblox-entry-attributes": JSON.stringify(attributes)
            }
        });

        if (response.statusCode >= 200 && response.statusCode < 300) {
            return {
                value: this.fromJSON(await response.body.text()),
                headers: response.headers,
                statusCode: response.statusCode
            };
        } if (response.statusCode == 502) {
            throw new OpenCloudError("Bad Gateway", "INTERNAL", "Unknown");
        } else {
            let errorData = await response.body.json();
            throw new OpenCloudError(errorData.message, errorData.error, errorData.errorDetails[0].datastoreErrorCode);
        }
    }

    public async delete(key: string): Promise<DataStoreResponse<null>> {
        let response = await this.makeRequest("entries/entry", { entryKey: key }, {
            method: "DELETE"
        });

        if (response.statusCode >= 200 && response.statusCode < 300) {
            return {
                value: null,
                headers: response.headers,
                statusCode: response.statusCode
            };
        } if (response.statusCode == 502) {
            throw new OpenCloudError("Bad Gateway", "INTERNAL", "Unknown");
        } else {
            let errorData = await response.body.json();
            throw new OpenCloudError(errorData.message, errorData.error, errorData.errorDetails[0].datastoreErrorCode);
        }
    }

    // Version endpoints

    public async getVersion(key: string, versionId: string): Promise<DataStoreResponse<EntryVersionInfo>> {
        let response = await this.makeRequest("entries/entry/versions/version", { entryKey: key, versionId }, {
            method: "GET"
        });

        if (response.statusCode >= 200 && response.statusCode < 300) {
            return {
                value: this.fromJSON(await response.body.text()),
                headers: response.headers,
                statusCode: response.statusCode
            };
        } if (response.statusCode == 502) {
            throw new OpenCloudError("Bad Gateway", "INTERNAL", "Unknown");
        } else {
            let errorData = await response.body.json();
            throw new OpenCloudError(errorData.message, errorData.error, errorData.errorDetails[0].datastoreErrorCode);
        }
    }

    public async listVersions(key: string, limit: number = 50, sortOrder: "Ascending" | "Descending" = "Descending", startDate?: Date, endDate?: Date, cursor?: string): Promise<VersionListResponse> {
        let response = await this.makeRequest("entries/entry/versions", {
            limit,
            cursor,
            sortOrder,
            entryKey: key,
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null
        }, {
            method: "GET"
        });

        if (response.statusCode >= 200 && response.statusCode < 300) {
            return {
                value: this.fromJSON(await response.body.text()),
                headers: response.headers,
                statusCode: response.statusCode
            };
        } if (response.statusCode == 502) {
            throw new OpenCloudError("Bad Gateway", "INTERNAL", "Unknown");
        } else {
            let errorData = await response.body.json();
            throw new OpenCloudError(errorData.message, errorData.error, errorData.errorDetails[0].datastoreErrorCode);
        }
    }
}