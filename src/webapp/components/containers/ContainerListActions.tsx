import { TableAction } from "@eyeseetea/d2-ui-components";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { CloudDownload, CloudUpload, Storage, SaveAlt } from "@material-ui/icons";
import DetailsIcon from "@material-ui/icons/Details";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import LogsIcon from "@material-ui/icons/Save";
import DatabaseIcon from "@material-ui/icons/NextWeekSharp";
import StopIcon from "@material-ui/icons/Stop";

import _ from "lodash";
import React from "react";
import { Container } from "../../../domain/entities/Container";
import { Id } from "../../../domain/entities/Ref";

type Action = "start" | "stop" | "goToDhis2" | "commit" | "push" | "pull" | "logs" | "download-db";

export interface UseContainerActionsOptions {
    rows: Container[];
    onAction(action: Action, options: { container: Container; containers: Container[] }): void;
}

export function useContainerActions(options: UseContainerActionsOptions): {
    actions: TableAction<Container>[];
} {
    const { rows, onAction } = options;

    const getContainers = React.useCallback(
        (ids: Id[]) => {
            return _(rows)
                .keyBy(container => container.id)
                .at(ids)
                .compact()
                .value();
        },
        [rows]
    );

    const action = React.useCallback(
        (name: Action, text: string, attrs: Omit<TableAction<Container>, "name" | "text">): TableAction<Container> => {
            const onClick = (ids: Id[]) => {
                const containers = getContainers(ids);
                const container = _.first(containers);
                if (container) onAction(name, { container, containers });
            };
            return { name, text, onClick, multiple: false, ...attrs };
        },
        [getContainers, onAction]
    );

    const actions: TableAction<Container>[] = [
        action("goToDhis2", i18n.t("Goto DHIS2 instance"), {
            icon: <DatabaseIcon />,
            isActive: forRunningContainers,
        }),
        action("start", i18n.t("Start container"), {
            multiple: true,
            icon: <PlayArrowIcon />,
            isActive: forStoppedContainers,
        }),
        action("stop", i18n.t("Stop container"), {
            multiple: true,
            icon: <StopIcon />,
            isActive: forRunningContainers,
        }),
        action("logs", i18n.t("Download logs"), {
            multiple: false,
            icon: <SaveAlt />,
        }),
        action("download-db", i18n.t("Download database"), {
            multiple: false,
            icon: <Storage />,
            isActive: forRunningContainers,
        }),
        action("commit", i18n.t("Commit container"), {
            multiple: true,
            icon: <LogsIcon />,
            isActive: forRunningContainers,
        }),
        action("push", i18n.t("Push image"), {
            multiple: true,
            icon: <CloudUpload />,
        }),
        action("pull", i18n.t("Pull image"), {
            multiple: true,
            icon: <CloudDownload />,
        }),
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            icon: <DetailsIcon />,
        },
    ];

    return { actions };
}

function forRunningContainers(containers: Container[]): boolean {
    return _(containers).every(container => container.status === "RUNNING");
}

function forStoppedContainers(containers: Container[]): boolean {
    return _(containers).every(container => container.status === "STOPPED");
}
