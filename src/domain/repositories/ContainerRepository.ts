import { FutureData } from "../entities/Future";

export interface ContainerRepository {
    listAll(): FutureData<any>;
}
