import { UseCase } from "../../CompositionRoot";
import { FutureData } from "../entities/Future";
import { ContainerRepository } from "../repositories/ContainerRepository";
import { Container } from "../../domain/entities/Container";

export class ListAllContainersUseCase implements UseCase {
    constructor(private containerRepository: ContainerRepository) {}

    public execute(): FutureData<Container[]> {
        return this.containerRepository.listAll();
    }
}