import {
    composeValidators,
    createMaxCharacterLength,
    createMinCharacterLength,
    hasValue,
    InputFieldFF,
} from "@dhis2/ui";
import _ from "lodash";
import React from "react";
import { NewContainer } from "../../../domain/entities/Container";
import { FormField } from "../form/FormField";
import { ProjectFF } from "./components/ProjectFF";
import { Dropzone } from "../dropzone/Dropzone";
import i18n from "../../../utils/i18n";

const useValidations = (field: NewContainerFormField): { validation?: (...args: any[]) => any; props?: object } => {
    switch (field) {
        case "port":
            return {
                validation: composeValidators(hasValue, createMinCharacterLength(1), createMaxCharacterLength(4)),
            };
        case "dbPort":
            return {
                validation: composeValidators(createMinCharacterLength(1), createMaxCharacterLength(4)),
            };
        case "project":
        case "image":
            return {
                validation: composeValidators(hasValue, createMinCharacterLength(1), createMaxCharacterLength(255)),
            };
        default: {
            return { validation: requiredFields.includes(field) ? hasValue : undefined };
        }
    }
};

export const RenderNewContainerField: React.FC<{ field: NewContainerFormField }> = ({ field }) => {
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
        case "port":
        case "url":
        case "dbPort":
        case "deployPath":
        case "javaOpt": {
            return <FormField {...props} component={InputFieldFF} />;
        }
        case "tomcatServerXml": {
            return <FormField {...props} component={Dropzone} accept=".xml" />;
        }
        case "dhisConf": {
            return <FormField {...props} component={Dropzone} accept=".conf" />;
        }
        case "runSql": {
            return <FormField {...props} component={Dropzone} accept=".sql,.sql.gz,.dump" />;
        }
        case "runScript": {
            return <FormField {...props} component={Dropzone} accept=".sh" />;
        }
        case "project": {
            return <FormField {...props} component={ProjectFF} imageField={`container.image`} />;
        }
        default:
            return null;
    }
};

export type NewContainerFormField = keyof NewContainer;

export const fields: NewContainerFormField[] = ["project", "name", "port"];

export const advancedFields: NewContainerFormField[] = [
    "url",
    "dbPort",
    "deployPath",
    "javaOpt",
    "tomcatServerXml",
    "dhisConf",
    "runSql",
    "runScript",
];

export const requiredFields: NewContainerFormField[] = ["image", "port"];

export const getNewContainerName = (field: NewContainerFormField) => {
    switch (field) {
        case "name":
            return i18n.t("Name");
        case "project":
            return i18n.t("Project");
        case "image":
            return i18n.t("Image");
        case "port":
            return i18n.t("Port");
        case "url":
            return i18n.t("URL");
        case "dbPort":
            return i18n.t("Database Port");
        case "deployPath":
            return i18n.t("Deploy Path Namespace (i.e: `dhis2` serves `http://localhost:8080/dhis2`)", {
                nsSeparator: false,
            });
        case "javaOpt":
            return i18n.t("Java OPT (Gigabytes of RAM)");
        case "tomcatServerXml":
            return i18n.t("Tomcat Server XML");
        case "dhisConf":
            return i18n.t("DHIS Conf");
        case "runSql":
            return i18n.t("Run SQL");
        case "runScript":
            return i18n.t("Run Shell Script");
    }
};

export const getNewContainerFieldName = (field: NewContainerFormField) => {
    const name = getNewContainerName(field);
    const required = requiredFields.includes(field) ? "(*)" : undefined;
    return _.compact([name, required]).join(" ");
};
