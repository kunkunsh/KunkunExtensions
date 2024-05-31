import { createApp } from "vue";
import "./index.css";
import "./style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import { router } from "./lib/router";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
createApp(App).use(pinia).use(router).mount("#app");
