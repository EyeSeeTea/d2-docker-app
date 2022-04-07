import {
    composeValidators,
    createMaxCharacterLength,
    createMinCharacterLength,
    hasValue,
    InputFieldFF,
    SingleSelectFieldFF,
} from "@dhis2/ui";
import i18n from "@eyeseetea/d2-ui-components/locales";
import _ from "lodash";
import React from "react";
import { NewContainer } from "../../../domain/entities/Container";
import { FormField } from "../form/FormField";
import { ProjectFF } from "./components/ProjectFF";

const useValidations = (field: NewContainerFormField): { validation?: (...args: any[]) => any; props?: object } => {
    switch (field) {
        case "port":
        case "project":
        case "dhis2Data":
            return {
                validation: composeValidators(hasValue, createMinCharacterLength(1), createMaxCharacterLength(255)),
            };
        default: {
            return { validation: requiredFields.includes(field) ? hasValue : undefined };
        }
    }
};

export const RenderNewContainerField: React.FC<{ field: NewContainerFormField }> = ({
    field,
}) => {
    const name = `container.${field}`;
    const { validation, props: validationProps = {} } = useValidations(field);
    const props = {
        name,
        placeholder: getNewContainerFieldName(field),
        validate: validation,
        ...validationProps,
    };
    switch (field) {
        case "name": 
        case "port": {
            return <FormField {...props} component={InputFieldFF} />;
        }
        case "project": {
         return <FormField {...props} component={ProjectFF} dhis2DataArtifactField={`container.dhis2Data`} />;
        }

        default:
            return null;
    }
};

export type NewContainerFormField = keyof NewContainer;

export const fields: NewContainerFormField[] = ["project", "name", "port"];//, "project", "dhis2Data"

export const requiredFields: NewContainerFormField[] = ["dhis2Data", "port"]; //,"project",  "dhis2Data"

export const getNewContainerName = (field: NewContainerFormField) => {
    switch (field) {
        case "name":
            return i18n.t("Name");
        case "project":
            return i18n.t("Project");
        case "dhis2Data":
            return i18n.t("DHIS2 Data Artifact");
        case "port":
            return i18n.t("Port");
    }
};

export const getNewContainerFieldName = (field: NewContainerFormField) => {
    const name = getNewContainerName(field);
    const required = requiredFields.includes(field) ? "(*)" : undefined;
    return _.compact([name, required]).join(" ");
};
