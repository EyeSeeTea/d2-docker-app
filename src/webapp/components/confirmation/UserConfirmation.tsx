import React from "react";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { Maybe } from "../../../types/utils";
import i18n from "../../../utils/i18n";

export interface ConfirmationProps {
    confirmation: ConfirmationState;
}

export interface Confirmation {
    message: string;
    action(): void;
}

export interface ConfirmationState {
    confirmation: Maybe<Confirmation>;
    setConfirmation: React.Dispatch<React.SetStateAction<Confirmation | undefined>>;
}

export const UserConfirmation: React.FC<ConfirmationProps> = props => {
    const {
        confirmation: { confirmation, setConfirmation },
    } = props;
    const closeConfirmation = React.useCallback(() => setConfirmation(undefined), [setConfirmation]);
    if (!confirmation) return null;

    const { message, action } = confirmation;

    return (
        <ConfirmationDialog
            isOpen={true}
            title={message}
            saveText={i18n.t("Yes")}
            cancelText={i18n.t("Cancel")}
            onSave={action}
            onCancel={closeConfirmation}
        >
            {i18n.t("Are you sure?")}
        </ConfirmationDialog>
    );
};
