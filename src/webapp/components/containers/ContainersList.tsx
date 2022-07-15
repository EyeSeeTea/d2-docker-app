import {
    ObjectsTable,
    ObjectsTableDetailField,
    TableColumn,
    TableInitialState,
    TableSelection,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import React, { useMemo, useState } from "react";
import { Container, initialContainer, ContainerDefinition } from "../../../domain/entities/Container";
import i18n from "../../../utils/i18n";
import { useAppContext } from "../../contexts/app-context";
import { Refresher, useRefresher } from "../../hooks/useRefresher";
import { UserConfirmation } from "../confirmation/UserConfirmation";
import { Link } from "../links/Link";
import { ContainerForm } from "./ContainerForm";
import { useContainerActions } from "./ContainerListActions";
import { useActionRunners } from "./ContainerListRunner";

export const ContainersList: React.FC = React.memo(() => {
    const [_selection, _setSelection] = useState<TableSelection[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [containerForm, setContainerForm] = React.useState<ContainerDefinition>();

    const refresher = useRefresher();
    const columns = useMemo(getColumns, []);
    const details = getDetails();

    const rows = useContainerLoader({ setIsLoading, refresher });
    const { onAction, confirmation } = useActionRunners({ setIsLoading, refresher, setContainerForm });
    const { actions } = useContainerActions({ rows, onAction });
    const { refresh } = refresher;

    const closeFormAndReloadList = React.useCallback(() => {
        setContainerForm(undefined);
        refresh();
    }, [setContainerForm, refresh]);

    const openEmptyForm = React.useCallback(() => setContainerForm(initialContainer), []);

    return (
        <div>
            <ContainerForm close={closeFormAndReloadList} container={containerForm} />
            <UserConfirmation confirmation={confirmation} />

            <ObjectsTable<Container>
                rows={rows}
                columns={columns}
                initialState={initialState}
                forceSelectionColumn={true}
                loading={isLoading}
                actions={actions}
                details={details}
                searchBoxLabel={i18n.t("Search by name")}
                onActionButtonClick={openEmptyForm}
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
                const tooltip = i18n.t("Open DHIS2 instance");
                return <Link name={container.name} url={container.dhis2Url} tooltip={tooltip} />;
            },
        },
        {
            name: "status",
            text: i18n.t("Status"),
            sortable: true,
            getValue: container => {
                const style: React.CSSProperties =
                    container.status === "RUNNING" ? { color: "#080", fontWeight: "bold" } : { color: "#422" };
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
