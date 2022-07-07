import { FutureData } from "../entities/Future";
import { ContainersRepository } from "../repositories/ContainersRepository";
import { Container } from "../../domain/entities/Container";

export class ListAllContainersUseCase {
    constructor(private containerRepository: ContainersRepository) {}

    public execute(): FutureData<Container[]> {
        return this.containerRepository.getAll();
    }
}
