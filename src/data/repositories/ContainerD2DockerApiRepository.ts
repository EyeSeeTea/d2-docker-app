import AbortController from "abort-controller";
import _ from "lodash";
import { D2Api } from "@eyeseetea/d2-api/2.34";
import { Future, FutureData } from "../../domain/entities/Future";
import { User } from "../../domain/entities/User";
import { ContainerRepository } from "../../domain/repositories/ContainerRepository";
import { cache } from "../../utils/cache";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";
import { Instance } from "../entities/Instance";
import i18n from "../../locales";

export class ContainerD2DockerApiRepository implements ContainerRepository {
    private api: D2Api;
    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }
/*
.map(({ containers }) =>
        containers.map(({ description, name, status }: {description: string, name: string, status: string}) => ({ description, name, status })));
*/
    public listAll(): FutureData<any> {
        //return this.api.baseUrl;
        return futureFetch<any>("get", "http://localhost:5000/instances")
        .map((data) => data )}
}
function buildParams(params?: Record<string, string | number | boolean>): string | undefined {
    if (!params) return undefined;
    return _.map(params, (value, key) => `$${key}=${value}`).join("&");
}

function futureFetch<Data>(
    method: "get" | "post",
    path: string,
    options: {
        body?: string;
        textResponse?: boolean;
        params?: Record<string, string | number | boolean>;
        bearer?: string;
        corsProxy?: boolean;
    } = {}
): FutureData<Data> {
    const { body, textResponse = false, params, bearer, corsProxy = process.env.NODE_ENV === "development" } = options;
    const controller = new AbortController();
    const qs = buildParams(params);
    const url = `${path}${qs ? `?${qs}` : ""}`;
    const fetchUrl = corsProxy ? addCORSProxy(url) : url;

    return Future.fromComputation<string, Data>((resolve, reject) => {
        fetch(fetchUrl, {
            signal: controller.signal,
            method,
            headers: {
                "Content-Type": "application/json",
                "x-requested-with": "XMLHttpRequest",
                Authorization: bearer ? `Bearer ${bearer}` : "",
            },
            body,
        })
            .then(async response => {
                if (!response.ok) {
                    reject(
                        i18n.t(`API error code: {{statusText}} ({{status}})`, {
                            nsSeparator: false,
                            statusText: response.statusText,
                            status: response.status,
                        })
                    );
                } else if (textResponse) {
                    const text = await response.text();
                    resolve(text as unknown as Data);
                } else {
                    const json = await response.json();
                    resolve(json);
                }
            })
            .catch(err => reject(err ? err.message : "Unknown error"));

        return controller.abort;
    }).flatMapError(err => {
        if (corsProxy) return Future.error(err);
        return futureFetch<Data>(method, path, { ...options, corsProxy: true });
    });
}

function addCORSProxy(url: string): string {
    return url.replace(/^(.*?:\/\/)(.*)/, "$1dev.eyeseetea.com/cors/$2");
}
