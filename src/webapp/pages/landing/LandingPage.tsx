import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { Card, CardGrid } from "../../components/card-grid/CardGrid";
import styled from "styled-components";
import { Button, NoticeBox } from "@dhis2/ui";
import {
    ObjectsTable,
    ObjectsTableDetailField,
    RowConfig,
    TableAction,
    TableColumn,
    TableSelection,
    TableState,
    useSnackbar,
    ConfirmationDialog
} from "@eyeseetea/d2-ui-components";
import { Form } from "react-final-form";
import _ from "lodash";
import {
    DialogContent,
} from "@material-ui/core";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { NewContainer } from "../../../domain/entities/Container";
import DetailsIcon from '@material-ui/icons/Details';
import StopIcon from '@material-ui/icons/Stop';
import { useAppContext } from "../../contexts/app-context";
import i18n from "../../../locales";
import { fields, getNewContainerFieldName, RenderNewContainerField } from "./NewContainerForm";


export const LandingPage: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [rows, setRows] = useState<any[]>([{
        description: "docker.eyeseetea.com/eyeseetea/dhis2-data:2.33.6-sp-cpr-dev2 STOPPED", 
        name: "docker.eyeseetea.com/eyeseetea/dhis2-data:2.33.6-sp-cpr-dev2", 
        status: "STOPPED"
      }, 
      {
        description: "docker.eyeseetea.com/eyeseetea/dhis2-data:2.34-play2 STOPPED", 
        name: "docker.eyeseetea.com/eyeseetea/dhis2-data:2.34-play2", 
        status: "STOPPED"
      }
  ]);
    const [selection, setSelection] = useState<TableSelection[]>([]);
    const[thing, setThing] = useState<any>();
    console.log(thing)
    const [isLoading, setIsLoading] = useState<boolean>(false);



    const [openCreateContainer, setOpenCreateContainer] = useState<boolean>(false);
    const [initialNewContainer, setInitialNewContainer] = useState<NewContainer>({
        project: "",
        dhis2Data: "",
        port: "",
        name: "",
    });


    //getValue: (row: any) => compositionRoot.container.listAll(),
    const columns = useMemo(
        (): TableColumn<any>[] => [
            { name: "name", text: i18n.t("Name"), sortable: true },
            { name: "description", text: i18n.t("Description"), sortable: true },
            {
                name: "status",
                text: i18n.t("Status"),
                sortable: true,
            },
        ],
        []
    );
    const details: ObjectsTableDetailField<any>[] = [
        { name: "name", text: i18n.t("Name") },
        { name: "description", text: i18n.t("Description") },
        { name: "status", text: i18n.t("Status") },
    ];
    const actions = useMemo(
        (): TableAction<any>[] => [
            {
                name: "start",
                text: i18n.t("Start container"),
                multiple: false,
                icon: <PlayArrowIcon />,
                onClick: (selection: string[]) => console.log(`start $${selection[0]}!`) 
            },
            {
                name: "stop",
                text: i18n.t("Stop container"),
                multiple: false,
                icon: <StopIcon />,
                onClick: (selection: string[]) => console.log(`stop $${selection[0]}!`)
            },
            {
                name: "details",
                text: i18n.t("Details"),
                multiple: false,
                icon: <DetailsIcon />,
                onClick: (selection: string[]) => console.log(`details of $${selection[0]}!`)
            },
        ],
        []
    );

    useEffect(() => {
        setIsLoading(true);
        compositionRoot.container.listAll().run(
            data => {
                console.log(data)
                setThing(data);
                //setIsLoading(false);
            },
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar]);
    const onSubmit = useCallback(
        async (newContainer: NewContainer) => {
            console.log("submitting connec")
        },
        []
    );
    return <div>
        <ConfirmationDialog
            isOpen={openCreateContainer}
            title={i18n.t("Create new container")}
            onCancel={() => setOpenCreateContainer(false)}
            cancelText={i18n.t("Ok")}
            maxWidth={"lg"}
            fullWidth={true}
        >
            <DialogContent>
                <h1>Hello!</h1>
                <Form<NewContainer>
                autocomplete="off"
                keepDirtyOnReinitialize={true}
                initialValuesEqual={(a, b) => _.isEqual(a, b)}
                onSubmit={onSubmit}
                initialValues={initialNewContainer}
                render={({ handleSubmit, values, submitError }) => (
                    <form onSubmit={handleSubmit}>
                        {submitError && (
                            <NoticeBox title={i18n.t("Error saving connection")} error={true}>
                                {submitError}
                            </NoticeBox>
                        )}

                        {fields.map(field => (
                            <Row key={`connection-row-${field}`}>
                                <Label>{getNewContainerFieldName(field)}</Label>
                                <RenderNewContainerField values={values} row={0} field={field} />
                            </Row>
                        ))}

                        <ButtonsRow>
                            <Button type="submit" primary>
                                {i18n.t("Save")}
                            </Button>

                            <Button type="reset">
                                {i18n.t("Cancel")}
                            </Button>
                        </ButtonsRow>
                    </form>
                )}
            />
            </DialogContent>
        </ConfirmationDialog>
    <ObjectsTable<any>
        rows={rows}
        columns={columns}
        forceSelectionColumn={true}
        loading={isLoading}
        selection={selection}
        actions={actions}
        details={details}
        searchBoxLabel={i18n.t("Search by name")}
        onActionButtonClick={() => setOpenCreateContainer(true)}
    />
</div>;
});
const Row = styled.div`
    margin: 20px 0;
`;

const Label = styled.b`
    display: block;
    margin-bottom: 15px;
`;

const ButtonsRow = styled.div`
    display: flex;
    gap: 20px;
    padding-top: 10px;
    margin-right: 9px;
`;

const Spacer = styled.span`
    flex-grow: 1;
`;