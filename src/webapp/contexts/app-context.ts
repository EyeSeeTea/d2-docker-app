import React, { useContext } from "react";
import { CompositionRoot } from "../../CompositionRoot";

export interface AppContextState {
    compositionRoot: CompositionRoot;
}

export const AppContext = React.createContext<AppContextState | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (context) {
        return context;
    } else {
        throw new Error("App context uninitialized");
    }
}
