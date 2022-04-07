import React, { useCallback, useEffect, useMemo, useState } from "react";
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
    ConfirmationDialog,
} from "@eyeseetea/d2-ui-components";
import { Form, Field } from "react-final-form";
import _ from "lodash";
import { DialogContent } from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import { NewContainer, Container } from "../../../domain/entities/Container";
import DetailsIcon from "@material-ui/icons/Details";
import StopIcon from "@material-ui/icons/Stop";
import { useAppContext } from "../../contexts/app-context";
import i18n from "../../../locales";
import { fields, getNewContainerFieldName, RenderNewContainerField } from "../../components/new-container-form/NewContainerForm";

export const LandingPage: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [rows, setRows] = useState<Container[]>([]);
    console.log(rows)
    const [selection, setSelection] = useState<TableSelection[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const [openCreateContainer, setOpenCreateContainer] = useState<boolean>(false);
    const [initialNewContainer, setInitialNewContainer] = useState<NewContainer>({
        project: "",
        dhis2Data: "",
        port: "8080",
        name: "",
    });

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
    //I could send the endpoint I want to call and the name so it can only be 1 endpoint
    const startContainer = useCallback((selection: string[]) => {
        setIsLoading(true);
        if(selection && selection[0]) {
            compositionRoot.container.start(selection[0]).run(data => {
                snackbar.success("Image started successfully");
                setRefreshKey(Math.random());
            },
            error => snackbar.error(error))
        }
        else {
            setIsLoading(false);
            return;
        }
    },[compositionRoot.container, snackbar]);
    const stopContainer = useCallback((selection: string[]) => {
        setIsLoading(true);
        if(selection && selection[0]) {
            compositionRoot.container.stop(selection[0]).run(data => {
                snackbar.success("Image stopped successfully");
                setRefreshKey(Math.random());
            },
            error => snackbar.error(error))
        }
        else {
            setIsLoading(false);
            return;
        }
    }, [compositionRoot.container, snackbar]);

    const actions = useMemo(
        (): TableAction<any>[] => [
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
        ],
        [startContainer, stopContainer]
    );

    useEffect(() => {
        setIsLoading(true);
        compositionRoot.container.listAll().run(
            data => {
                const processed = data.map(item => ({...item, id: item.name}))
                setRows(processed)
            }
,
            error => snackbar.error(error)
        );
        setIsLoading(false);
    }, [compositionRoot, snackbar, refreshKey]);
    
    const onSubmit = async (values: any) => {
        
        console.log("submitting new container");
        console.log(values)
        //setOpenCreateContainer(false);
    }

   /*
         onCancel={() => setOpenCreateContainer(false)}
                cancelText={i18n.t("Ok")}
                                            <ConfirmationDialog
                isOpen={openCreateContainer}
                title={i18n.t("Create new container")} 
                maxWidth={"lg"}
                fullWidth={true}
            >
                <DialogContent>
                                            </DialogContent>
            </ConfirmationDialog>
   */
    return (
        <div>
                    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit, form, submitting, pristine }) => (
        <form onSubmit={handleSubmit}>
           {fields.map(field => (
                <Row key={`container-row-${field}`}>
                    <Label>{getNewContainerFieldName(field)}</Label>
                    <RenderNewContainerField field={field} />
                </Row>
                                ))}
          <div className="buttons">
            <button type="submit" disabled={submitting || pristine}>
              Submit
            </button>
            <button
              type="button"
              onClick={form.reset}
              disabled={submitting || pristine}
            >
              Reset
            </button>
          </div>
        </form>
      )}
    />
                
            
            <ObjectsTable<Container>
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
        </div>
    );
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
    justify-content: flex-end;
    gap: 20px;
    padding-top: 10px;
    margin-right: 9px;
`;

const Spacer = styled.span`
    flex-grow: 1;
`;
