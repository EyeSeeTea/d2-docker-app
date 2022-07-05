import React, { useEffect, useState } from "react";
import _ from "lodash";
import { LoadingProvider, SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { appConfig } from "../../../app-config";
import { getCompositionRoot } from "../../../CompositionRoot";
import Share from "../../components/share/Share";
import { AppContext, AppContextState } from "../../contexts/app-context";
import { Router } from "../Router";
import "./App.css";

export interface AppProps {}

export const App: React.FC<AppProps> = React.memo(function App() {
    const [showShareButton, setShowShareButton] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);

    useEffect(() => {
        async function setup() {
            const compositionRoot = getCompositionRoot();
            const isShareButtonVisible = _(appConfig).get("appearance.showShareButton") || false;

            setAppContext({ compositionRoot });
            setShowShareButton(isShareButtonVisible);
            setLoading(false);
        }
        setup();
    }, []);

    if (loading) return null;

    return (
        <SnackbarProvider>
            <LoadingProvider>
                <div id="app" className="content">
                    <AppContext.Provider value={appContext}>
                        <Router />
                    </AppContext.Provider>
                </div>

                <Share visible={showShareButton} />
            </LoadingProvider>
        </SnackbarProvider>
    );
});
