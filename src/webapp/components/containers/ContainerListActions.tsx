import { TableAction, useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { LocalHospital, SaveAlt } from "@material-ui/icons";
import DetailsIcon from "@material-ui/icons/Details";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";

import _ from "lodash";
import React, { useCallback } from "react";
import {
    Container,
    getContainerDefinitionFromContainer,
    ContainerDefinition,
} from "../../../domain/entities/Container";
import { FutureData } from "../../../domain/entities/Future";
import { Id } from "../../../domain/entities/Ref";
import { useAppContext } from "../../contexts/app-context";
import { useCallbackEffect } from "../../hooks/useCallbackEffect";
import { Refresher } from "../../hooks/useRefresher";
import { goTo } from "../../utils/links";

interface UseActionsOptions {
    setIsLoading(state: boolean): void;
    refresher: Refresher;
    rows: Container[];
    setContainerForm(container: ContainerDefinition): void;
}

export function useContainerActions(options: UseActionsOptions): {
    actions: TableAction<Container>[];
} {
    const { setIsLoading, refresher, rows, setContainerForm } = options;
    const { refresh } = refresher;
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const runAction = useCallback(
        (options: { actionMsg: string; successMsg: string; action: () => FutureData<void> }) => {
            const { actionMsg, successMsg, action } = options;
            loading.show(true, actionMsg);

            return action().run(
                () => {
                    snackbar.success(successMsg);
                    refresh();
                    loading.hide();
                    setIsLoading(false);
                },
                error => {
                    snackbar.error(error);
                    loading.hide();
                    setIsLoading(false);
                }
            );
        },
        [snackbar, setIsLoading, refresh, loading]
    );

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

    const onFirstContainer = React.useCallback(
        (ids: Id[], action: (container: Container) => void) => {
            const container = _.first(getContainers(ids));
            if (container) action(container);
        },
        [getContainers]
    );

    const startContainer = useCallback(
        (ids: Id[]) => {
            onFirstContainer(ids, container => setContainerForm(getContainerDefinitionFromContainer(container)));
        },
        [onFirstContainer, setContainerForm]
    );

    const stopContainer = useCallback(
        (ids: Id[]) => {
            const info = ": " + ids.join(", ");
            return runAction({
                actionMsg: i18n.t("Stopping container") + info,
                successMsg: i18n.t("Container stopped") + info,
                action: () => compositionRoot.container.stop.execute(getContainers(ids).map(c => c.image)),
            });
        },
        [compositionRoot, runAction, getContainers]
    );

    const commitContainers = useCallback(
        (ids: Id[]) => {
            const info = ": " + ids.join(", ");
            return runAction({
                actionMsg: i18n.t("Committing container") + info,
                successMsg: i18n.t("Container commited") + info,
                action: () => compositionRoot.container.commit.execute(getContainers(ids)),
            });
        },
        [compositionRoot, runAction, getContainers]
    );

    const goToDhis2 = useCallback(
        (ids: Id[]) => {
            onFirstContainer(ids, container => {
                if (container.dhis2Url) goTo(container.dhis2Url);
            });
        },
        [onFirstContainer]
    );

    const actions: TableAction<Container>[] = [
        {
            name: "dhis2-instance",
            text: i18n.t("Goto DHIS2 instance"),
            multiple: false,
            icon: <LocalHospital />,
            onClick: goToDhis2,
            isActive: containers => _(containers).every(container => container.status === "RUNNING"),
        },
        {
            name: "start",
            text: i18n.t("Start container"),
            multiple: true,
            icon: <PlayArrowIcon />,
            onClick: startContainer,
            isActive: forStoppedContainers,
        },
        {
            name: "stop",
            text: i18n.t("Stop container"),
            multiple: true,
            icon: <StopIcon />,
            onClick: useCallbackEffect(stopContainer),
            isActive: forRunningContainers,
        },
        {
            name: "commit",
            text: i18n.t("Commit container"),
            multiple: true,
            icon: <SaveAlt />,
            onClick: useCallbackEffect(commitContainers),
            isActive: forRunningContainers,
        },
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
