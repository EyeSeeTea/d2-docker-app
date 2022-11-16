import { FutureData } from "../entities/Future";
import { Container, ContainerDefinition } from "../entities/Container";
import { Image } from "../entities/Image";

export interface ContainersRepository {
    getAll(): FutureData<Container[]>;
    start(image: Image): FutureData<void>;
    startInitial(container: ContainerDefinition): FutureData<{ url: string }>;
    stop(image: Image): FutureData<void>;
    commit(container: Container): FutureData<void>;
    downloadLogs(container: Container, options: { limit: number }): FutureData<void>;
    downloadDatabase(container: Container): FutureData<void>;
}
