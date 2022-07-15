import React from "react";

type Callback = () => void;

type UseBooleanReturn = [boolean, UseBooleanActions];

interface UseBooleanActions {
    update: (newValue: boolean) => void;
    set: Callback;
    unset: Callback;
    toggle: Callback;
}

export function useBooleanState(initialValue = false): UseBooleanReturn {
    const [value, setValue] = React.useState(initialValue);

    const actions = React.useMemo<UseBooleanActions>(() => {
        return {
            update: (newValue: boolean) => setValue(newValue),
            set: () => setValue(true),
            unset: () => setValue(false),
            toggle: () => setValue(value_ => !value_),
        };
    }, [setValue]);

    return [value, actions];
}
