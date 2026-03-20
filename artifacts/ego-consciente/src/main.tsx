import { detectDemoOnLoad } from "./components/demo-detector";

detectDemoOnLoad();

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
