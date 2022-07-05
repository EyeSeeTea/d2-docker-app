import _ from "lodash";
import { FutureData } from "../../domain/entities/Future";
import { ContainerRepository } from "../../domain/repositories/ContainerRepository";
import { Container, NewContainer } from "../../domain/entities/Container";
import { Image } from "../../domain/entities/Image";
import { Project } from "../../domain/entities/Project";
import { fetchGet, fetchPost } from "../utils/future-fetch";

function getImageFromRawName(name: string): Image | undefined {
    const parts = name.split("/");
    switch (parts.length) {
        case 2: {
            const [projectName = "", imageName = ""] = parts;
            return { project: projectName, name: imageName };
        }
        case 3: {
            const [_registryUrl = "", projectName = "", imageName = ""] = parts;
            return { project: projectName, name: imageName };
        }
        default:
            return undefined;
    }
}

export class ContainerD2DockerApiRepository implements ContainerRepository {
    public getAll(): FutureData<Container[]> {
        return fetchGet<InstancesGetResponse>(this.getD2DockerApiUrl("/instances")).map(({ containers }) =>
            _(containers)
                .map((apiContainer): Container | undefined => {
                    const image = getImageFromRawName(apiContainer.name);
                    return image
                        ? { id: apiContainer.name, name: apiContainer.name, image, status: apiContainer.status }
                        : undefined;
                })
                .compact()
                .value()
        );
    }

    public getProjects(): FutureData<Project[]> {
        return fetchGet<HarborProject[]>(this.getHarborApiUrl("projects"));
    }

    public getImages(project: string): FutureData<Image[]> {
        return fetchGet<Artifact[]>(this.getHarborApiUrl(`/projects/${project}/repositories/dhis2-data/artifacts`)).map(
            artifacts =>
                _(artifacts)
                    .flatMap(artifact => (artifact.type === "IMAGE" ? artifact.tags : []))
                    .map(tag => ({ project, name: tag.name }))
                    .compact()
                    .value()
        );
    }

    public pullImage(image: Image): FutureData<void> {
        return fetchPost<D2DockerPullRequest, void>(this.getD2DockerApiUrl("/instances/pull"), {
            data: {
                image: this.getDockerImage(image),
            },
        });
    }

    public pushImage(image: Image): FutureData<void> {
        return fetchPost<D2DockerPushRequest, void>(this.getD2DockerApiUrl("/instances/push"), {
            data: {
                image: this.getDockerImage(image),
            },
        });
    }

    public createImage(container: NewContainer): FutureData<void> {
        const sourceImage: Image = { project: container.project, name: container.image };
        const destImage: Image = { project: container.project, name: container.name };

        return fetchPost<D2DockerCopyRequest, void>(this.getD2DockerApiUrl("/instances/copy"), {
            data: {
                source: this.getDockerImage(sourceImage),
                destinations: [this.getDockerImage(destImage)],
            },
        });
    }

    public start(container: NewContainer): FutureData<void> {
        return fetchPost<D2DockerStartRequest, void>(this.getD2DockerApiUrl("/instances/start"), {
            data: {
                image: this.getDockerImage({ project: container.project, name: container.name }),
                port: parseInt(container.port),
                detach: true,
            },
        });
    }

    public stop(image: Image): FutureData<void> {
        return fetchPost<D2DockerStopRequest, void>(this.getD2DockerApiUrl("/instances/stop"), {
            data: {
                image: this.getDockerImage(image),
            },
        });
    }

    /* Private methods */

    private getDockerImage(image: Image): string {
        return `docker.eyeseetea.com/${image.project}/dhis2-data:${image.name}`;
    }

    private getD2DockerApiUrl(path: string): string {
        const path2 = path.replace(/^\//, "");
        return `http://localhost:5000/${path2}`;
    }

    private getHarborApiUrl(path: string): string {
        const path2 = path.replace(/^\//, "");
        return `${this.getD2DockerApiUrl("/harbor")}/https://docker.eyeseetea.com/api/v2.0/${path2}`;
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

interface D2DockerPullRequest {
    image: string;
}

interface D2DockerPushRequest {
    image: string;
}

type DockerImage = string;

interface D2DockerCopyRequest {
    source: DockerImage;
    destinations: DockerImage[];
}

interface D2DockerStartRequest {
    image: string;
    port: number;
    detach: boolean;
}

interface D2DockerStopRequest {
    image: string;
}
