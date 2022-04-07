import AbortController from "abort-controller";
import _ from "lodash";
import { Future, FutureData } from "../../domain/entities/Future";
import { ContainerRepository } from "../../domain/repositories/ContainerRepository";
import i18n from "../../locales";
import { Container } from "../../domain/entities/Container";

export class ContainerD2DockerApiRepository implements ContainerRepository {

    public listAll(): FutureData<Container[]> {
        return futureFetch<{ containers: Container[] }>("get", "http://localhost:5000/instances").map(
            ({ containers }) => containers
        );
    }

    public listProjects(): FutureData<any> {
        return futureFetch<any>(
            "get",
            "http://localhost:5000/harbor/https://docker.eyeseetea.com/api/v2.0/projects"
        ).map(data => data);
    }

    public listRepoArtifacts(project: string): FutureData<any> {
        return futureFetch<any>(
            "get",
            `http://localhost:5000/harbor/https://docker.eyeseetea.com/api/v2.0/projects/${project}/repositories/dhis2-data/artifacts`
        ).map(data => data);
    }
    public createContainerImage(project: string, dhis2DataArtifact: string, name?: string): FutureData<any> {
        //example: docker.eyeseetea.com/samaritans/dhis2-data:2.36.8-sp-ip-training
        const dataToSend = JSON.stringify(
            {
                image: `docker.eyeseetea.com/${project}/dhis2-data:${dhis2DataArtifact}`,
            },
            null,
            3
        );
        return futureFetch<any>("post", "http://localhost:5000/instances/pull", {
            body: dataToSend,
        }).map(data => data);
    }

    public start(name: string): FutureData<void> {
        const dataToSend = JSON.stringify(
            {
                image: name,
                port: 8080,
                detach: true,
            },
            null,
            3
        );
        return futureFetch<any>("post", "http://localhost:5000/instances/start", {
            body: dataToSend,
        }).map(data => data);
    }

    public stop(name: string): FutureData<void> {
        const dataToSend = JSON.stringify(
            {
                image: name,
                port: 8080,
                detach: true,
            },
            null,
            3
        );
        return futureFetch<any>("post", "http://localhost:5000/instances/stop", {
            body: dataToSend,
        }).map(({ containers }) => containers);
    }
}

export type Project = {
    name: string;
    chart_count: number;
    creation_time: Date;
    current_user_role_id: number;
    current_user_role_ids: number[];
    cve_allowlist: CveAllowlist;
    metadata: Metadata;
    owner_id: number;
    owner_name: string;
    project_id: number;
    repo_count: number;
    update_time: Date;
};
type CveAllowlist = {
    creation_time: Date;
    id: number;
    items: string[];
    project_id: number;
    update_time: Date;
};
type Metadata = {
    public: string;
};
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
    const fetchUrl = url;

    return Future.fromComputation<string, Data>((resolve, reject) => {
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
