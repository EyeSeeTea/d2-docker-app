import React from "react";
import { Button } from "@dhis2/ui";
import { Form, FormProps } from "react-final-form";
import { DialogContent } from "@material-ui/core";
import {
    fields,
    advancedFields,
    getNewContainerFieldName,
    ContainerField,
} from "../../components/new-container-form/NewContainerForm";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import i18n from "../../../utils/i18n";
import { useBooleanState } from "../../hooks/useBoolean";
import styled from "styled-components";
import { initialContainer, NewContainer } from "../../../domain/entities/Container";

export interface ContainerFormProps {
    isOpen: boolean;
    close(): void;
    container?: NewContainer;
}

export const ContainerForm: React.FC<ContainerFormProps> = React.memo(props => {
    const { isOpen: isContainerFormOpen, close: closeContainerForm } = props;
    const [showAdvancedProperties, { toggle: toggleAdvancedProperties }] = useBooleanState(false);
    const container = props.container || initialContainer;

    const onSubmit = React.useCallback<FormProps["onSubmit"]>(async values => {
        console.debug(values);

        /*compositionRoot.container.createImage("eyeseetea", "2.34-WIDP-DEV").run(
            data => {
                snackbar.success("Image created successfully");
                setRefreshKey(Math.random());
            },
            error => snackbar.error(error)
        )*/
        //setOpenCreateContainer(false);
    }, []);

    return (
        <ConfirmationDialog
            isOpen={isContainerFormOpen}
            title={i18n.t("Create new container")}
            maxWidth="lg"
            fullWidth={true}
        >
            <DialogContent>
                <Form
                    onSubmit={onSubmit}
                    render={({ handleSubmit, submitting, pristine }) => (
                        <form onSubmit={handleSubmit}>
                            {fields.map(field => (
                                <Field key={field} field={field} container={container} />
                            ))}

                            <Button onClick={toggleAdvancedProperties}>{i18n.t("Advanced properties")}</Button>

                            {showAdvancedProperties &&
                                advancedFields.map(field => <Field key={field} field={field} container={container} />)}

                            <ButtonsRow>
                                <Button type="submit" primary disabled={submitting || pristine}>
                                    {i18n.t("Submit")}
                                </Button>

                                <Button type="button" onClick={closeContainerForm}>
                                    {i18n.t("Cancel")}
                                </Button>
                            </ButtonsRow>
                        </form>
                    )}
                />
            </DialogContent>
        </ConfirmationDialog>
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

const Field: React.FC<{ field: keyof NewContainer; container: NewContainer }> = props => {
    const { field, container } = props;

    return (
        <Row key={`container-row-${field}`}>
            <Label>{getNewContainerFieldName(field)}</Label>
            <ContainerField field={field} container={container} />
        </Row>
    );
};
