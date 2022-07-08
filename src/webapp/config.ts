import { Config } from "../domain/entities/Config";

/* Config variables are overridable using environment variables `REACT_APP_NAME` (check envMapping) */

export const defaultConfig: Config = {
    d2DockerApiUrl: "http://localhost:5000",
    registryHost: "docker.eyeseetea.com",
    dhis2Host: "localhost",
    hideAdvancedOptions: false,
};

function getFromEnv(envVarName: string): string | undefined {
    return process.env[`REACT_APP_${envVarName}`];
}

function get(defaultValue: string, envName: string): string {
    const valueFromEnv = getFromEnv(envName);
    return valueFromEnv ?? defaultValue;
}

function getBoolean(defaultValue: boolean, envName: string): boolean {
    const truthyStrings = ["1", "true", "yes", "on"];
    const valueFromEnv = getFromEnv(envName);
    return valueFromEnv === undefined ? defaultValue : truthyStrings.includes(valueFromEnv);
}

export function getConfig(): Config {
    return {
        d2DockerApiUrl: get(defaultConfig.d2DockerApiUrl, "D2_DOCKER_API_URL"),
        registryHost: get(defaultConfig.registryHost, "REGISTRY_HOST"),
        dhis2Host: get(defaultConfig.dhis2Host, "DHIS2_HOST"),
        hideAdvancedOptions: getBoolean(defaultConfig.hideAdvancedOptions, "HIDE_ADVANCED_OPTIONS"),
    };
}
