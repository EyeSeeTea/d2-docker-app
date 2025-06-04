import { TableSelection, useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import i18n from "@eyeseetea/d2-ui-components/locales";
import React from "react";
import {
    Container,
    ContainerDefinition,
    getContainerDefinitionFromContainer,
} from "../../../domain/entities/Container";
import { FutureData, initFuture } from "../../../domain/entities/Future";
import { Image } from "../../../domain/entities/Image";
import { useAppContext } from "../../contexts/app-context";
import { Refresher } from "../../hooks/useRefresher";
import { goTo } from "../../utils/links";
import { Confirmation, ConfirmationState } from "../confirmation/UserConfirmation";
import { UseContainerActionsOptions } from "./ContainerListActions";
import { List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { CheckCircleOutline, HighlightOff } from "@material-ui/icons";
import styled from "styled-components";

export interface UseActionRunnersOptions {
    setIsLoading(state: boolean): void;
    refresher: Refresher;
    setContainerForm(container: ContainerDefinition): void;
    setSelection(selection: TableSelection[]): void;
}

type OnAction = UseContainerActionsOptions["onAction"];

interface UseActionRunnersResponse {
    onAction: OnAction;
    confirmation: ConfirmationState;
}

export function useActionRunners(options: UseActionRunnersOptions): UseActionRunnersResponse {
    const { setIsLoading, refresher, setContainerForm, setSelection } = options;
    const { compositionRoot, config } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();
    const [confirmation, setConfirmation] = React.useState<Confirmation>();
    const { refresh } = refresher;

    const runAction = React.useCallback(
        (options: {
            askConfirmation?: boolean;
            actionMsg: string;
            successMsg?: string;
            action: () => FutureData<void>;
            body?: React.ReactNode;
            message?: string;
        }) => {
            const { askConfirmation = false, actionMsg, successMsg, action, body, message } = options;

            function run() {
                return initFuture(() => loading.show(true, actionMsg))
                    .tap(() => setConfirmation(undefined))
                    .flatMap(action)
                    .run(
                        () => {
                            if (successMsg) snackbar.success(successMsg);
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
            }

            if (askConfirmation) {
                setConfirmation({ message: message || actionMsg, action: run, body });
            } else {
                return run();
            }
        },
        [snackbar, setIsLoading, refresh, loading]
    );

    const onAction = React.useCallback<OnAction>(
        (action, { container, containers }) => {
            const names = ": " + containers.map(container => container.id).join(", ");

            switch (action) {
                case "goToDhis2": {
                    if (container.dhis2Url) goTo(container.dhis2Url);
                    break;
                }
                case "start": {
                    const containerDefinition = getContainerDefinitionFromContainer(config, container);
                    setContainerForm(containerDefinition);
                    break;
                }
                case "stop":
                    return runAction({
                        actionMsg: i18n.t("Stop container") + names,
                        successMsg: i18n.t("Container stopped") + names,
                        action: () => compositionRoot.container.stop.execute(getImages(containers)),
                    });
                case "logs":
                    return runAction({
                        actionMsg: i18n.t("Download container logs") + names,
                        action: () => compositionRoot.container.downloadLogs.execute(container),
                    });
                case "download-db":
                    return runAction({
                        actionMsg: i18n.t("Download container database (sql.gz)") + names,
                        action: () => compositionRoot.container.downloadDatabase.execute(container),
                    });
                case "commit":
                    return runAction({
                        askConfirmation: true,
                        actionMsg: i18n.t("Commit containers") + names,
                        message: i18n.t("Commit containers"),
                        body: <ContainerList containers={containers} />,
                        successMsg: i18n.t("Container commited") + names,
                        action: () => compositionRoot.container.commit.execute(containers),
                    });
                case "push":
                    return runAction({
                        askConfirmation: true,
                        actionMsg: i18n.t("Push images") + names,
                        message: i18n.t("Push images"),
                        body: <ContainerList containers={containers} />,
                        successMsg: i18n.t("Image pushed") + names,
                        action: () => compositionRoot.images.push(getImages(containers)),
                    });
                case "pull":
                    return runAction({
                        askConfirmation: true,
                        actionMsg: i18n.t("Pull images") + names,
                        message: i18n.t("Pull images"),
                        body: <ContainerList containers={containers} />,
                        successMsg: i18n.t("Image pulled") + names,
                        action: () => compositionRoot.images.pull(getImages(containers)),
                    });
                case "delete":
                    return runAction({
                        askConfirmation: true,
                        actionMsg: i18n.t("Delete containers") + names,
                        message: i18n.t(
                            "You’re about to permanently delete the following containers. Any data saved locally inside them will be lost. This action cannot be undone."
                        ),
                        body: <ContainerList containers={containers} warning={true} />,
                        successMsg: i18n.t("Deleted") + names,
                        action: () => compositionRoot.images.delete(getImages(containers)).map(() => setSelection([])),
                    });
                default:
                    throw new Error(`Action not implemented: ${action}`);
            }
        },
        [compositionRoot, runAction, setContainerForm, config]
    );

    return { onAction, confirmation: { confirmation, setConfirmation } };
}

function getImages(containers: Container[]): Image[] {
    return containers.map(c => c.image);
}

function ContainerList(props: { containers: Container[]; warning?: boolean }) {
    const { containers, warning = false } = props;
    return (
        <StyledList dense={true} warning={warning}>
            {containers.map(container => (
                <ListItem key={container.id}>
                    <ListItemIcon color="inherit" aria-label="delete">
                        {warning ? <HighlightOff /> : <CheckCircleOutline />}
                    </ListItemIcon>
                    <ListItemText primary={container.id} />
                </ListItem>
            ))}
        </StyledList>
    );
}

const StyledList = styled(List)<{ warning?: boolean }>`
    margin-bottom: 8px;

    & li {
        border-left: 4px solid ${({ warning }) => (warning ? "#f44336" : "#4caf50")};
        border-radius: 1px;
        padding: 2px 8px;
        background-color: ${({ warning }) => (warning ? "#fff5f5" : "#e8f5e9")};
    }

    & li > div:first-child {
        min-width: 32px;

        & svg {
            color: ${({ warning }) => (warning ? "#f44336" : "#4caf50")};
        }
    }
`;
