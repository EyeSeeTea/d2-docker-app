import { command, run, string, option } from "cmd-ts";
import path from "path";

function main() {
    const cmd = command({
        name: path.basename(__filename),
        description: "Show DHIS2 instance info",
        args: {
            url: option({
                type: string,
                long: "url",
                short: "u",
                description: "URL option",
            }),
        },
        handler: async args => {
            console.debug(args);
        },
    });

    run(cmd, process.argv.slice(2));
}

main();
