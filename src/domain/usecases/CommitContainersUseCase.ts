import { Container } from "../entities/Container";
import { Future, FutureData } from "../entities/Future";
import { ContainersRepository } from "../repositories/ContainersRepository";

export class CommitContainersUseCase {
    constructor(private containersRepository: ContainersRepository) {}

    public execute(containers: Container[]): FutureData<void> {
        const starts$ = containers.map(container => this.containersRepository.commit(container));
        return Future.parallel(starts$).map(() => undefined);
    }
}
