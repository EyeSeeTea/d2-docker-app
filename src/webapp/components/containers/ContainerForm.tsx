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
import { NewContainer, NewContainerValid } from "../../../domain/entities/Container";
import { useLoading } from "@eyeseetea/d2-ui-components";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { useAppContext } from "../../contexts/app-context";

export interface ContainerFormProps {
    close(): void;
    container?: NewContainer;
}

export const ContainerForm: React.FC<ContainerFormProps> = React.memo(props => {
    const { close: closeContainerForm, container } = props;

    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();
    const [showAdvancedProperties, { toggle: toggleAdvancedProperties }] = useBooleanState(false);

    const onSubmit = React.useCallback<FormProps["onSubmit"]>(
        async formValues => {
            const container = formValues.container as NewContainerValid;

            const onProgress = (msg: string, progressPercent: number) => {
                loading.show(true, msg);
                loading.updateProgress(progressPercent);
            };

            return compositionRoot.container.createImageAndStart.execute(container, { onProgress }).run(
                () => {
                    loading.hide();
                    snackbar.success(i18n.t("Image started successfully"));
                    closeContainerForm();
                },
                error => {
                    loading.hide();
                    snackbar.error(error);
                }
            );
        },
        [snackbar, loading, compositionRoot, closeContainerForm]
    );

    if (!container) return null;

    return (
        <ConfirmationDialog isOpen={true} title={i18n.t("Create new container")} maxWidth="lg" fullWidth>
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
