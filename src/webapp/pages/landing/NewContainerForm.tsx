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
import { FormField } from "../../components/form/FormField";

const useValidations = (field: NewContainerFormField): { validation?: (...args: any[]) => any; props?: object } => {
    switch (field) {
        case "name":
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

export const RenderNewContainerField: React.FC<{ row: number; field: NewContainerFormField; values: NewContainer }> = ({
    values,
    row,
    field,
}) => {
    const name = `connections[${row}].${field}`;
    const { validation, props: validationProps = {} } = useValidations(field);

    const props = {
        name,
        placeholder: getNewContainerFieldName(field),
        validate: validation,
        ...validationProps,
    };

    switch (field) {
        case "name":
        case "dhis2Data":
        case "project": {
            return <FormField {...props} component={InputFieldFF} />;
        }
        /*case "dataEndpoint": {
            const { martCode = "", environment = "UAT" } = values[row] ?? {};
            const domain = getDomain(environment);
            const url = `${domain}/${martCode}`;

            return <FormField {...props} component={InputFieldFF} initialValue={url} />;
        }
        case "environment": {
            return (
                <FormField
                    {...props}
                    options={[
                        { label: i18n.t("Production"), value: "PROD" },
                        { label: i18n.t("UAT"), value: "UAT" },
                    ]}
                    component={SingleSelectFieldFF}
                />
            );
        }*/
        default:
            return null;
    }
};

export type NewContainerFormField = keyof NewContainer;

export const fields: NewContainerFormField[] = ["name", "project", "dhis2Data"];

export const requiredFields: NewContainerFormField[] = ["name", "project", "dhis2Data"];

export const getNewContainerName = (field: NewContainerFormField) => {
    switch (field) {
        case "name":
            return i18n.t("Name");
        case "project":
            return i18n.t("Project");
        case "dhis2Data":
            return i18n.t("dhis2-data");
    }
};

export const getNewContainerFieldName = (field: NewContainerFormField) => {
    const name = getNewContainerName(field);
    const required = requiredFields.includes(field) ? "(*)" : undefined;
    return _.compact([name, required]).join(" ");
};

