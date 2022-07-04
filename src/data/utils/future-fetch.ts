import AbortController from "abort-controller";
import _ from "lodash";
import { Future, FutureData } from "../../domain/entities/Future";
import i18n from "../../utils/i18n";

export function futureFetch<ResponseData, RequestData = unknown>(
    method: "get" | "post",
    path: string,
    options: {
        data?: RequestData;
        textResponse?: boolean;
        params?: Record<string, string | number | boolean>;
        bearer?: string;
        corsProxy?: boolean;
    } = {}
): FutureData<ResponseData> {
    const { data, textResponse = false, params, bearer, corsProxy = process.env.NODE_ENV === "development" } = options;
    const controller = new AbortController();
    const qs = buildParams(params);
    const url = `${path}${qs ? `?${qs}` : ""}`;
    const fetchUrl = url;

    return Future.fromComputation<string, ResponseData>((resolve, reject) => {
        fetch(fetchUrl, {
            signal: controller.signal,
            method,
            headers:
                method === "post"
                    ? {
                          "Content-Type": "application/json",
                          "x-requested-with": "XMLHttpRequest",
                          Authorization: bearer ? `Bearer ${bearer}` : "",
                      }
                    : {
                          "x-requested-with": "XMLHttpRequest",
                          Authorization: bearer ? `Bearer ${bearer}` : "",
                      },
            body: JSON.stringify(data),
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
                    resolve(text as unknown as ResponseData);
                } else {
                    const json = await response.json();
                    resolve(json);
                }
            })
            .catch(err => reject(err ? err.message : "Unknown error"));

        return controller.abort;
    }).flatMapError(err => {
        if (corsProxy) return Future.error(err);
        return futureFetch<ResponseData>(method, path, { ...options, corsProxy: true });
    });
}

function buildParams(params?: Record<string, string | number | boolean>): string | undefined {
    if (!params) return undefined;
    return _.map(params, (value, key) => `$${key}=${value}`).join("&");
}
