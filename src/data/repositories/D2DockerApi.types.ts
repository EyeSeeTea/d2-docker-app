export interface HarborProject {
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

export interface CveAllowlist {
    creation_time: Date;
    id: number;
    items: string[];
    project_id: number;
    update_time: Date;
}

export type ApiContainer = ApiContainerStopped | ApiContainerRunning;

export interface ApiContainerBase {
    name: string;
    description: string;
}

interface ApiContainerStopped extends ApiContainerBase {
    status: "STOPPED";
}

interface ApiContainerRunning extends ApiContainerBase {
    status: "RUNNING";
    port: number;
}

export interface InstancesGetResponse {
    containers: ApiContainer[];
}

export interface BuildHistory {
    absolute: boolean;
    href: string;
}

export interface ExtraAttrs {
    architecture: string;
    author: string;
    config: Record<string, string[]>;
    created: Date;
    os: string;
}

export interface Tag {
    artifact_id: string;
    id: string;
    immutable: boolean;
    name: string;
    pull_time: Date;
    push_time: Date;
    repository_id: number;
    signed: boolean;
}

export type Artifact = ImageArtifact | { type: "UNKNOWN" };

export interface ImageArtifact {
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
    tags: Tag[] | null;
    type: "IMAGE";
}

export interface D2DockerPullRequest {
    image: string;
}

export interface D2DockerPushRequest {
    image: string;
}

type DockerImage = string;

export interface D2DockerCopyRequest {
    source: DockerImage;
    destinations: DockerImage[];
}

export interface D2DockerStartRequest {
    image: string;
    detach: boolean;
    port?: number;
    keep_containers: boolean;
}

export interface D2DockerStopRequest {
    image: string;
}

export interface D2DockerDownloadLogsRequest {
    image: string;
    limit?: number;
}

export interface D2DockerDownloadDatabaseRequest {
    image: string;
    limit?: number;
}

export interface D2DockerCommitRequest {
    image: string;
}

export interface D2DockerPushRequest {
    image: string;
}

export interface D2DockerPullRequest {
    image: string;
}

export interface D2DockerRmRequest {
    images: string[];
}
