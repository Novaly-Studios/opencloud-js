import lodash from "lodash";
import crypto from "crypto";
import { Dispatcher, request } from "undici";

export default class APIRequest {
    readonly apiKey: string;

    public constructor(apiKey: string) {
        this.apiKey = apiKey;
    };

    public getHash(content: string) {
        return crypto.createHash("md5").update(content).digest("base64");
    }

    public fromJSON(json: string) {
        return JSON.parse(json.replace(/inf/g, "\"INF_REPLACE_ME\""));
    }

    public toJSON(object: any) {
        return JSON.stringify(object).replace(/\"INF_REPLACE_ME\"/g, "inf");
    }

    public async makeRequest(location: string, params: { [key: string]: any }, options: Partial<Dispatcher.RequestOptions> = {}) {
        let url = new URL(location);

        for (let key in params) {
            if (params[key]) {
                url.searchParams.append(key, params[key]);
            }
        }

        return await request(url, lodash.merge({
            headers: {
                "x-api-key": this.apiKey
            }
        }, options));
    }
}