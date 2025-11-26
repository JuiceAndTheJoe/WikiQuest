// TODO make a reactive model (application state), pass it as prop to the components used
import { createRoot } from "react-dom/client";
import { ReactRoot } from "./ReactRoot";

if (import.meta.hot) {
  import.meta.hot.accept();
}

const mountedApp = createRoot(document.getElementById("root"));
mountedApp.render(<ReactRoot />);
