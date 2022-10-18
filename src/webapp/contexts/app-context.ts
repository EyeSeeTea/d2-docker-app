import React, { useContext } from "react";
import { CompositionRoot } from "../../CompositionRoot";
import { Config } from "../../domain/entities/Config";

export interface AppContextState {
    compositionRoot: CompositionRoot;
    config: Config;
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
