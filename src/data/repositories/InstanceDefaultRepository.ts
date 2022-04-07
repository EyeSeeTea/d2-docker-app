import { D2Api } from "@eyeseetea/d2-api/2.34";
import { InstanceRepository } from "../../domain/repositories/InstanceRepository";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { Instance } from "../entities/Instance";

export class InstanceDefaultRepository implements InstanceRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public getBaseUrl(): string {
        return this.api.baseUrl;
    }
}
