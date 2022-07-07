import _ from "lodash";
import { FutureData } from "../../domain/entities/Future";
import { ContainersRepository } from "../../domain/repositories/ContainersRepository";
import { Container, getLocalImageFromContainer, ContainerDefinitionValid } from "../../domain/entities/Container";
import { buildImage, Image } from "../../domain/entities/Image";
import { fetchGet, fetchPost } from "../utils/future-fetch";
import { InstancesGetResponse, D2DockerStartRequest, D2DockerStopRequest, ApiContainer } from "./D2DockerApi.types";

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

export class ContainersD2DockerApiRepository implements ContainersRepository {
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

    public start(image: Image): FutureData<void> {
        return fetchPost<D2DockerStartRequest, void>(this.getD2DockerApiUrl("/instances/start"), {
            data: {
                image: this.getDockerDataImage(image),
                detach: true,
            },
        });
    }

    public startInitial(container: ContainerDefinitionValid): FutureData<void> {
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

    private getHarborPublicDataImageUrl(image: Image): string | undefined {
        const parts = [image.registryUrl, "harbor/projects", image.project, "repositories/dhis2-data"];
        return `https://${parts.join("/")}`;
    }

    private getDhis2PublicUrl(apiContainer: ApiContainer): string | undefined {
        return apiContainer.status === "RUNNING" ? `http://localhost:${apiContainer.port}` : undefined;
    }
}
