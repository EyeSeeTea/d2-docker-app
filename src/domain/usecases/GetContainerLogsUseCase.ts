import { Container } from "../entities/Container";
import { FutureData } from "../entities/Future";
import { ContainersRepository } from "../repositories/ContainersRepository";

export class GetContainerLogsUseCase {
    constructor(private containersRepository: ContainersRepository) {}

    public execute(container: Container): FutureData<void> {
        return this.containersRepository.downloadLogs(container, { limit: 200_000 });
    }
}
