import ReactDOM from "react-dom";
import "./webapp/utils/wdyr";
import { App } from "./webapp/pages/app/App";

async function main() {
    ReactDOM.render(<App />, document.getElementById("root"));
}

main();
