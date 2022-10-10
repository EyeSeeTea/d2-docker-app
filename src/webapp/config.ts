import { Config } from "../domain/entities/Config";

/* Config variables are overridable using environment variables `REACT_APP_NAME` (check envMapping) */

export const defaultConfig: Config = {
    d2DockerApiUrl: "http://localhost:5000",
    registryHost: "docker.eyeseetea.com",
    dhis2Host: "localhost",
    hideAdvancedOptions: false,
    defaultDhis2Port: 8080,
};

function getFromEnv(name: string): string {
    const varName = `REACT_APP_${name}`;
    const value = process.env[varName];

    if (value === undefined) {
        throw new Error(`${varName} not defined`);
    } else {
        return value;
    }
}

function get(envName: string): string {
    return getFromEnv(envName);
}

function getBoolean(envName: string): boolean {
    const truthyStrings = ["1", "true", "yes", "on"];
    const valueFromEnv = getFromEnv(envName);
    return truthyStrings.includes(valueFromEnv);
}

export function getConfig(): Config {
    return {
        d2DockerApiUrl: get("D2_DOCKER_API_URL"),
        registryHost: get("REGISTRY_HOST"),
        dhis2Host: get("DHIS2_HOST"),
        hideAdvancedOptions: getBoolean("HIDE_ADVANCED_OPTIONS"),
        defaultDhis2Port: parseInt(get("DEFAULT_DHIS2_PORT") || "8080"),
    };
}
