import "./app.css";
import App from "./DetectQRCode.svelte";

const app = new App({
  target: document.getElementById("app")!,
});

export default app;
