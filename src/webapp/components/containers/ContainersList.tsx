import {
    ObjectsTable,
    ObjectsTableDetailField,
    TableAction,
    TableColumn,
    TableInitialState,
    TableSelection,
    useLoading,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import DetailsIcon from "@material-ui/icons/Details";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";
import _ from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { Container } from "../../../domain/entities/Container";
import { FutureData } from "../../../domain/entities/Future";
import { Id } from "../../../domain/entities/Ref";
import i18n from "../../../utils/i18n";
import { useAppContext } from "../../contexts/app-context";
import { useBooleanState } from "../../hooks/useBoolean";
import { Refresher, useRefresher } from "../../hooks/useRefresher";
import { ContainerForm } from "./ContainerForm";

export const ContainersList: React.FC = React.memo(() => {
    const [_selection, _setSelection] = useState<TableSelection[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const columns = useMemo(getColumns, []);
    const details = getDetails();
    const refresher = useRefresher();
    const rows = useContainerLoader({ setIsLoading, refresher });
    const { actions } = useContainerActions({ setIsLoading, refresher, rows });
    const { refresh } = refresher;

    const [containerFormIsOpen, { enable: openContainerForm, disable: closeContainerForm }] = useBooleanState(false);

    const closeFormAndReloadList = React.useCallback(() => {
        closeContainerForm();
        refresh();
    }, [closeContainerForm, refresh]);

    return (
        <div>
            <ContainerForm isOpen={containerFormIsOpen} close={closeFormAndReloadList} />

            <ObjectsTable<Container>
                rows={rows}
                columns={columns}
                initialState={initialState}
                forceSelectionColumn={true}
                loading={isLoading}
                actions={actions}
                details={details}
                searchBoxLabel={i18n.t("Search by name")}
                onActionButtonClick={openContainerForm}
            />
        </div>
    );
});

const initialState: TableInitialState<Container> = {
    sorting: { field: "status", order: "asc" },
};

function getDetails(): ObjectsTableDetailField<Container>[] {
    return [
        {
            name: "name",
            text: i18n.t("Name"),
            getValue: container => {
                return container.url ? <a href={container.url}>{container.id}</a> : container.id;
            },
        },
        { name: "status", text: i18n.t("Status") },
    ];
}

function getColumns(): TableColumn<Container>[] {
    return [
        { name: "name", text: i18n.t("Name"), sortable: true },
        { name: "status", text: i18n.t("Status"), sortable: true },
    ];
}

interface UseContainerLoaderOptions {
    setIsLoading: (state: boolean) => void;
    refresher: Refresher;
}

function useContainerLoader(options: UseContainerLoaderOptions): Container[] {
    const { setIsLoading, refresher } = options;
    const [containers, setContainers] = useState<Container[]>([]);
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    React.useEffect(() => {
        setIsLoading(true);

        compositionRoot.container.getAll.execute().run(
            containers => {
                setContainers(containers);
                setIsLoading(false);
            },
            error => {
                snackbar.error(error);
                setIsLoading(false);
            }
        );
    }, [compositionRoot, snackbar, refresher.value, setIsLoading]);

    return containers;
}

interface UseActionsOptions {
    setIsLoading: (state: boolean) => void;
    refresher: Refresher;
    rows: Container[];
}

function useContainerActions(options: UseActionsOptions): {
    actions: TableAction<Container>[];
} {
    const { setIsLoading, refresher, rows } = options;
    const { refresh } = refresher;
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const runAction = useCallback(
        (options: { actionMsg: string; successMsg: string; action: () => FutureData<void> }) => {
            const { actionMsg, successMsg, action } = options;
            loading.show(true, actionMsg);
            action().run(
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

    const getImages = React.useCallback(
        (ids: Id[]) => {
            return _(rows)
                .keyBy(container => container.id)
                .at(ids)
                .compact()
                .map(container => container.image)
                .value();
        },
        [rows]
    );

    const startContainer = useCallback(
        (ids: Id[]) => {
            runAction({
                actionMsg: i18n.t("Starting container(s)") + ": " + ids.join(", "),
                successMsg: i18n.t("Image(s) started successfully"),
                action: () => compositionRoot.container.start.execute(getImages(ids)),
            });
        },
        [compositionRoot, runAction, getImages]
    );

    const stopContainer = useCallback(
        (ids: Id[]) => {
            runAction({
                actionMsg: i18n.t("Stopping container(s)") + ": " + ids.join(", "),
                successMsg: i18n.t("Image(s) stopped successfully"),
                action: () => compositionRoot.container.stop.execute(getImages(ids)),
            });
        },
        [compositionRoot, runAction, getImages]
    );

    const actions: TableAction<Container>[] = [
        {
            name: "start",
            text: i18n.t("Start container"),
            multiple: true,
            icon: <PlayArrowIcon />,
            onClick: startContainer,
            isActive: containers => _(containers).every(container => container.status === "STOPPED"),
        },
        {
            name: "stop",
            text: i18n.t("Stop container"),
            multiple: true,
            icon: <StopIcon />,
            onClick: stopContainer,
            isActive: containers => _(containers).every(container => container.status === "RUNNING"),
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
