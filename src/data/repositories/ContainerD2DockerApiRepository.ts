import _ from "lodash";
import { FutureData } from "../../domain/entities/Future";
import { ContainerRepository } from "../../domain/repositories/ContainerRepository";
import { Container } from "../../domain/entities/Container";
import { Image } from "../../domain/entities/Image";
import { Project } from "../../domain/entities/Project";
import { futureFetch } from "../utils/future-fetch";

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
        const dataToSend: D2DockerPullRequest = {
            image: `docker.eyeseetea.com/${projectName}/dhis2-data:${imageName}`,
        };

        return futureFetch<void, D2DockerPullRequest>("post", "http://localhost:5000/instances/pull", {
            data: dataToSend,
        });
    }

    public start(name: string): FutureData<void> {
        const dataToSend: D2DockerStartRequest = {
            image: name,
            port: 8080,
            detach: true,
        };

        return futureFetch<void, D2DockerStartRequest>("post", "http://localhost:5000/instances/start", {
            data: dataToSend,
        });
    }

    public stop(name: string): FutureData<void> {
        const dataToSend: D2DockerStopRequest = { image: name };

        return futureFetch<void, D2DockerStopRequest>("post", "http://localhost:5000/instances/stop", {
            data: dataToSend,
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

interface D2DockerStartRequest {
    image: string;
    port: number;
    detach: boolean;
}

interface D2DockerStopRequest {
    image: string;
}
