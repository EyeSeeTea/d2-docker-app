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
import { LocalHospital } from "@material-ui/icons";
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
import { goTo } from "../../utils/links";
import { Link } from "../links/Link";
import { ContainerForm } from "./ContainerForm";

export const ContainersList: React.FC = React.memo(() => {
    const [_selection, _setSelection] = useState<TableSelection[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formIsOpen, { set: openForm, unset: closeForm }] = useBooleanState(false);

    const refresher = useRefresher();
    const columns = useMemo(getColumns, []);
    const details = getDetails();
    const rows = useContainerLoader({ setIsLoading, refresher });
    const { actions } = useContainerActions({ setIsLoading, refresher, rows });
    const { refresh } = refresher;

    const closeFormAndReloadList = React.useCallback(() => {
        closeForm();
        refresh();
    }, [closeForm, refresh]);

    return (
        <div>
            <ContainerForm isOpen={formIsOpen} close={closeFormAndReloadList} />

            <ObjectsTable<Container>
                rows={rows}
                columns={columns}
                initialState={initialState}
                forceSelectionColumn={true}
                loading={isLoading}
                actions={actions}
                details={details}
                searchBoxLabel={i18n.t("Search by name")}
                onActionButtonClick={openForm}
            />
        </div>
    );
});

const initialState: TableInitialState<Container> = {
    sorting: { field: "status", order: "asc" },
};

function getColumns(): TableColumn<Container>[] {
    return [
        {
            name: "name",
            text: i18n.t("Name"),
            sortable: true,
            getValue: container => {
                return <Link name={container.name} url={container.dhis2Url} tooltip={i18n.t("Open DHIS2 instance")} />;
            },
        },
        {
            name: "status",
            text: i18n.t("Status"),
            sortable: true,
            getValue: container => {
                const style: React.CSSProperties =
                    container.status === "RUNNING" ? { color: "#080", fontWeight: "bold" } : {};
                return <span style={style}> {container.status}</span>;
            },
        },
    ];
}

function getDetails(): ObjectsTableDetailField<Container>[] {
    return [
        {
            name: "name",
            text: i18n.t("Name"),
            getValue: container => {
                return <Link name={container.id} url={container.harborUrl} />;
            },
        },
        {
            name: "status",
            text: i18n.t("Status"),
        },
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

    const startContainer = useCallback(
        (ids: Id[]) => {
            runAction({
                actionMsg: i18n.t("Starting container(s)") + ": " + ids.join(", "),
                successMsg: i18n.t("Image(s) started successfully"),
                action: () => compositionRoot.container.start.execute(getContainers(ids).map(c => c.image)),
            });
        },
        [compositionRoot, runAction, getContainers]
    );

    const stopContainer = useCallback(
        (ids: Id[]) => {
            runAction({
                actionMsg: i18n.t("Stopping container(s)") + ": " + ids.join(", "),
                successMsg: i18n.t("Image(s) stopped successfully"),
                action: () => compositionRoot.container.stop.execute(getContainers(ids).map(c => c.image)),
            });
        },
        [compositionRoot, runAction, getContainers]
    );

    const goToDhis2 = useCallback(
        (ids: Id[]) => {
            const container = _.first(getContainers(ids));
            if (container && container.dhis2Url) goTo(container.dhis2Url);
        },
        [getContainers]
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
