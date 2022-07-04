import {
    ObjectsTable,
    ObjectsTableDetailField,
    TableAction,
    TableColumn,
    TableInitialState,
    TableSelection,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import DetailsIcon from "@material-ui/icons/Details";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";
import React, { useCallback, useMemo, useState } from "react";
import { Container } from "../../../domain/entities/Container";
import i18n from "../../../utils/i18n";
import { useAppContext } from "../../contexts/app-context";
import { useBooleanState } from "../../hooks/useBoolean";
import { ContainerForm } from "./ContainerForm";

export const ContainersList: React.FC = React.memo(() => {
    const [_selection, _setSelection] = useState<TableSelection[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const columns = useMemo(getColumns, []);
    const details = getDetails();

    const { actions, refreshKey } = useActions({ setIsLoading });
    const rows = useContainerLoader({ setIsLoading, refreshKey });

    const [containerFormIsOpen, { enable: openContainerForm, disable: closeContainerForm }] = useBooleanState(false);

    return (
        <div>
            <ContainerForm isOpen={containerFormIsOpen} close={closeContainerForm} />

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
        { name: "name", text: i18n.t("Name") },
        { name: "status", text: i18n.t("Status") },
    ];
}

function getColumns(): TableColumn<Container>[] {
    return [
        { name: "name", text: i18n.t("Name"), sortable: true },
        { name: "status", text: i18n.t("Status"), sortable: true },
    ];
}

function useContainerLoader(options: { setIsLoading: (state: boolean) => void; refreshKey: number }): Container[] {
    const { setIsLoading, refreshKey } = options;
    const [containers, setContainers] = useState<Container[]>([]);
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    React.useEffect(() => {
        setIsLoading(true);

        compositionRoot.container.getAll().run(
            containers => {
                setContainers(containers);
                setIsLoading(false);
            },
            error => {
                snackbar.error(error);
                setIsLoading(false);
            }
        );
    }, [compositionRoot, snackbar, refreshKey, setIsLoading]);

    return containers;
}

function useActions(options: { setIsLoading: (state: boolean) => void }): {
    actions: TableAction<Container>[];
    refreshKey: number;
} {
    const { setIsLoading } = options;
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [refreshKey, setRefreshKey] = useState(0);

    const startContainer = useCallback(
        (selection: string[]) => {
            setIsLoading(true);
            if (selection && selection[0]) {
                compositionRoot.container.start(selection[0]).run(
                    _data => {
                        snackbar.success("Image started successfully");
                        setRefreshKey(n => n + 1);
                    },
                    error => snackbar.error(error)
                );
            } else {
                setIsLoading(false);
                return;
            }
        },
        [compositionRoot.container, snackbar, setIsLoading]
    );

    const stopContainer = useCallback(
        (selection: string[]) => {
            setIsLoading(true);
            if (selection && selection[0]) {
                compositionRoot.container.stop(selection[0]).run(
                    _data => {
                        snackbar.success("Image stopped successfully");
                        setRefreshKey(Math.random());
                    },
                    error => snackbar.error(error)
                );
            } else {
                setIsLoading(false);
                return;
            }
        },
        [compositionRoot.container, snackbar, setIsLoading]
    );

    const actions = [
        {
            name: "start",
            text: i18n.t("Start container"),
            multiple: false,
            icon: <PlayArrowIcon />,
            onClick: startContainer,
        },
        {
            name: "stop",
            text: i18n.t("Stop container"),
            multiple: false,
            icon: <StopIcon />,
            onClick: stopContainer,
        },
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            icon: <DetailsIcon />,
        },
    ];

    return { actions, refreshKey };
}
