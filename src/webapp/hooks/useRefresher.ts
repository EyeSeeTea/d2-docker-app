import React from "react";

export interface Refresher {
    value: string;
    refresh: () => void;
}

export function useRefresher(): Refresher {
    const [date, setDate] = React.useState(new Date());
    const refresh = React.useCallback(() => {
        setDate(new Date());
    }, [setDate]);

    return { value: date.getTime().toString(), refresh };
}
