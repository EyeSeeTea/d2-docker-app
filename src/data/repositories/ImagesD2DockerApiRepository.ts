import _ from "lodash";
import { FutureData } from "../../domain/entities/Future";
import {
    getRemoteImageFromContainer,
    getImageInfoFromName,
    getLocalImageFromContainer,
    ContainerDefinitionValid,
} from "../../domain/entities/Container";
import { buildImage, Image } from "../../domain/entities/Image";
import { Project } from "../../domain/entities/Project";
import { fetchGet, fetchPost } from "../utils/future-fetch";
import {
    HarborProject,
    Artifact,
    D2DockerPullRequest,
    D2DockerPushRequest,
    D2DockerCopyRequest,
    D2DockerRmRequest,
} from "./D2DockerApi.types";
import { ImagesRepository } from "../../domain/repositories/ImagesRepository";
import { Config } from "../../domain/entities/Config";

export class ImagesD2DockerApiRepository implements ImagesRepository {
    registryHost: string;
    d2DockerApiUrl: string;

    constructor(config: Config) {
        this.registryHost = config.registryHost;
        this.d2DockerApiUrl = config.d2DockerApiUrl;
    }

    public getProjects(): FutureData<Project[]> {
        return fetchGet<HarborProject[]>(this.getHarborApiUrl("projects"));
    }

    public getForProject(project: string): FutureData<Image[]> {
        return fetchGet<Artifact[]>(this.getHarborApiUrl(`/projects/${project}/repositories/dhis2-data/artifacts`)).map(
            artifacts =>
                _(artifacts)
                    .flatMap(artifact => (artifact.type === "IMAGE" ? artifact.tags : []))
                    .compact()
                    .map(tag => getImageInfoFromName(tag.name))
                    .compact()
                    .map(attrs => buildImage({ registryUrl: this.registryHost, project, ...attrs }))
                    .value()
        );
    }

    public pull(image: Image): FutureData<void> {
        return fetchPost<D2DockerPullRequest, void>(this.getD2DockerApiUrl("/instances/pull"), {
            data: {
                image: this.getDockerDataImage(image),
            },
        });
    }

    public push(image: Image): FutureData<void> {
        return fetchPost<D2DockerPushRequest, void>(this.getD2DockerApiUrl("/instances/push"), {
            data: {
                image: this.getDockerDataImage(image),
            },
        });
    }

    public delete(image: Image): FutureData<void> {
        return fetchPost<D2DockerRmRequest, void>(this.getD2DockerApiUrl("/instances/rm"), {
            data: {
                images: [this.getDockerDataImage(image)],
            },
        });
    }

    public create(container: ContainerDefinitionValid): FutureData<void> {
        const sourceImage = getRemoteImageFromContainer(container);
        const destImage = getLocalImageFromContainer(container);

        return fetchPost<D2DockerCopyRequest, void>(this.getD2DockerApiUrl("/instances/copy"), {
            data: {
                source: this.getDockerDataImage(sourceImage),
                destinations: [this.getDockerDataImage(destImage)],
            },
        });
    }

    /* Private methods */

    private getDockerDataImage(image: Image): string {
        const dhis2DataImageName = `dhis2-data:${image.dhis2Version}-${image.name}`;
        const parts = [image.registryUrl, image.project, dhis2DataImageName];
        return _.compact(parts).join("/");
    }

    private getD2DockerApiUrl(path: string): string {
        const path2 = path.replace(/^\//, "");
        return this.d2DockerApiUrl + "/" + path2;
    }

    private getHarborApiUrl(path: string): string {
        const path2 = path.replace(/^\//, "");
        return `${this.getD2DockerApiUrl("/harbor")}/https://${this.registryHost}/api/v2.0/${path2}`;
    }
}
