import _ from "lodash";
import { Config } from "../domain/entities/Config";

/* Config variables overridable using REACT_APP_ variables (check envMapping) */

export const defaultConfig: Config = {
    d2DockerApiUrl: "http://localhost:5000",
    registryHost: "docker.eyeseetea.com",
    dhis2Host: "localhost",
};

const envMapping: Record<keyof Config, string> = {
    d2DockerApiUrl: "D2_DOCKER_API_URL",
    registryHost: "REGISTRY_HOST",
    dhis2Host: "DHIS2_HOST",
};

export function getConfig(): Config {
    return _(envMapping)
        .mapValues<string>((envBaseKey, key) => {
            const configKey = key as keyof Config;
            const envVariable = "REACT_APP_" + envBaseKey;
            const valueFromEnv = process.env[envVariable];
            const defaultValue = defaultConfig[configKey];
            return valueFromEnv || defaultValue;
        })
        .value();
}
