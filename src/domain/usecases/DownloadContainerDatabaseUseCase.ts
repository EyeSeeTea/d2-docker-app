import { Container } from "../entities/Container";
import { FutureData } from "../entities/Future";
import { ContainersRepository } from "../repositories/ContainersRepository";

export class DownloadContainerDatabaseUseCase {
    constructor(private containersRepository: ContainersRepository) {}

    public execute(container: Container): FutureData<void> {
        return this.containersRepository.downloadDatabase(container);
    }
}
