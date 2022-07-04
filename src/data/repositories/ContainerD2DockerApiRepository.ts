import AbortController from "abort-controller";
import _ from "lodash";
import { Future, FutureData } from "../../domain/entities/Future";
import { ContainerRepository } from "../../domain/repositories/ContainerRepository";
import { Container } from "../../domain/entities/Container";
import i18n from "../../utils/i18n";
import { Image } from "../../domain/entities/Image";
import { Project } from "../../domain/entities/Project";

export class ContainerD2DockerApiRepository implements ContainerRepository {
    public getAll(): FutureData<Container[]> {
        return futureFetch<InstancesGetResponse>("get", "http://localhost:5000/instances").map(({ containers }) =>
            containers.map(apiContainer => ({ ...apiContainer, id: apiContainer.name }))
        );
    }

    public getProjects(): FutureData<Project[]> {
        return futureFetch<HarborProject[]>(
            "get",
            "http://localhost:5000/harbor/https://docker.eyeseetea.com/api/v2.0/projects"
        );
    }

    public getImages(project: string): FutureData<Image[]> {
        return futureFetch<Artifact[]>(
            "get",
            `http://localhost:5000/harbor/https://docker.eyeseetea.com/api/v2.0/projects/${project}/repositories/dhis2-data/artifacts`
        ).map(artifacts =>
            _(artifacts)
                .flatMap(artifcat => (artifcat.type === "IMAGE" ? artifcat.tags : []))
                .map(tag => ({ name: tag.name }))
                .compact()
                .value()
        );
    }

    public createContainerImage(projectName: string, imageName: string): FutureData<void> {
        const dataToSend = JSON.stringify(
            {
                image: `docker.eyeseetea.com/${projectName}/dhis2-data:${imageName}`,
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
        return futureFetch("post", "http://localhost:5000/instances/start", {
            body: dataToSend,
        });
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
        return futureFetch("post", "http://localhost:5000/instances/stop", {
            body: dataToSend,
        });
    }
}

interface HarborProject {
    name: string;
    chart_count: number;
    creation_time: Date;
    current_user_role_id: number;
    current_user_role_ids: number[];
    cve_allowlist: CveAllowlist;
    metadata: { public: string };
    owner_id: number;
    owner_name: string;
    project_id: number;
    repo_count: number;
    update_time: Date;
}

interface CveAllowlist {
    creation_time: Date;
    id: number;
    items: string[];
    project_id: number;
    update_time: Date;
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

interface ApiContainer {
    name: string;
    description: string;
    status: "RUNNING" | "STOPPED";
}

interface InstancesGetResponse {
    containers: ApiContainer[];
}

interface BuildHistory {
    absolute: boolean;
    href: string;
}

interface ExtraAttrs {
    architecture: string;
    author: string;
    config: Record<string, string[]>;
    created: Date;
    os: string;
}

interface Tag {
    artifact_id: string;
    id: string;
    immutable: boolean;
    name: string;
    pull_time: Date;
    push_time: Date;
    repository_id: number;
    signed: boolean;
}

type Artifact = ImageArtifact | { type: "UNKNOWN" };

interface ImageArtifact {
    additions_links: { build_history: BuildHistory };
    digest: string;
    extra_attrs: ExtraAttrs;
    icon: string;
    id: number;
    labels: string[] | null;
    manifest_media_type: string;
    media_type: string;
    project_id: number;
    pull_time: Date;
    push_time: Date;
    references: string[] | null;
    repository_id: number;
    size: number;
    tags: Tag[];
    type: "IMAGE";
}
