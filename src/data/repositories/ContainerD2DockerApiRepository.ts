import _ from "lodash";
import { FutureData } from "../../domain/entities/Future";
import { ContainerRepository } from "../../domain/repositories/ContainerRepository";
import {
    Container,
    getRemoteImageFromContainer,
    getImageInfoFromName,
    getLocalImageFromContainer,
    NewContainerValid,
} from "../../domain/entities/Container";
import { buildImage, defaultRegistryUrl, Image } from "../../domain/entities/Image";
import { Project } from "../../domain/entities/Project";
import { fetchGet, fetchPost } from "../utils/future-fetch";
import {
    InstancesGetResponse,
    HarborProject,
    Artifact,
    D2DockerPullRequest,
    D2DockerPushRequest,
    D2DockerCopyRequest,
    D2DockerStartRequest,
    D2DockerStopRequest,
    ApiContainer,
} from "./D2DockerApi.types";

const registryUrl = defaultRegistryUrl;

function getImageFromRawName(name: string): Image | undefined {
    const parts = name.split("/");

    switch (parts.length) {
        case 3: {
            const [registryUrl = "", projectName = "", name = ""] = parts;
            const name2 = name.split(":")[1];
            if (!name2) return;
            const sp = name2.split("-");
            const version = sp[0];
            const name3 = sp.slice(1).join("-");
            return version && name3
                ? buildImage({ registryUrl, project: projectName, dhis2Version: version, name: name3 })
                : undefined;
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
                        ? {
                              id: apiContainer.name,
                              name: apiContainer.name,
                              harborUrl: this.getHarborPublicDataImageUrl(image),
                              dhis2Url: this.getDhis2PublicUrl(apiContainer),
                              image,
                              status: apiContainer.status,
                          }
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
                    .map(tag => getImageInfoFromName(tag.name))
                    .compact()
                    .map(attrs => buildImage({ registryUrl, project, ...attrs }))
                    .compact()
                    .value()
        );
    }

    public pullImage(image: Image): FutureData<void> {
        return fetchPost<D2DockerPullRequest, void>(this.getD2DockerApiUrl("/instances/pull"), {
            data: {
                image: this.getDockerDataImage(image),
            },
        });
    }

    public pushImage(image: Image): FutureData<void> {
        return fetchPost<D2DockerPushRequest, void>(this.getD2DockerApiUrl("/instances/push"), {
            data: {
                image: this.getDockerDataImage(image),
            },
        });
    }

    public createImage(container: NewContainerValid): FutureData<void> {
        const sourceImage = getRemoteImageFromContainer(container);
        const destImage = getLocalImageFromContainer(container);

        return fetchPost<D2DockerCopyRequest, void>(this.getD2DockerApiUrl("/instances/copy"), {
            data: {
                source: this.getDockerDataImage(sourceImage),
                destinations: [this.getDockerDataImage(destImage)],
            },
        });
    }

    public start(image: Image): FutureData<void> {
        return fetchPost<D2DockerStartRequest, void>(this.getD2DockerApiUrl("/instances/start"), {
            data: {
                image: this.getDockerDataImage(image),
                detach: true,
            },
        });
    }

    public startInitial(container: NewContainerValid): FutureData<void> {
        return fetchPost<D2DockerStartRequest, void>(this.getD2DockerApiUrl("/instances/start"), {
            data: {
                image: this.getDockerDataImage(getLocalImageFromContainer(container)),
                detach: true,
                port: parseInt(container.port),
            },
        });
    }

    public stop(image: Image): FutureData<void> {
        return fetchPost<D2DockerStopRequest, void>(this.getD2DockerApiUrl("/instances/stop"), {
            data: {
                image: this.getDockerDataImage(image),
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
        return `http://localhost:5000/${path2}`;
    }

    private getHarborApiUrl(path: string): string {
        const path2 = path.replace(/^\//, "");
        return `${this.getD2DockerApiUrl("/harbor")}/https://${registryUrl}/api/v2.0/${path2}`;
    }

    private getHarborPublicDataImageUrl(image: Image): string | undefined {
        const parts = [image.registryUrl, "harbor/projects", image.project, "repositories/dhis2-data"];
        return `https://${parts.join("/")}`;
    }

    private getDhis2PublicUrl(apiContainer: ApiContainer): string | undefined {
        return apiContainer.status === "RUNNING" ? `http://localhost:${apiContainer.port}` : undefined;
    }
}
