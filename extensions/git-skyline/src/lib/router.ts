import { createRouter, createWebHashHistory, createMemoryHistory } from "vue-router";
import MainPage from "../Main.vue";
import SettingPage from "../SettingPage.vue";

const routes = [
  { path: "/", name: "main", component: MainPage },
  { path: "/setting", name: "setting", component: SettingPage },
];
export const router = createRouter({
  history: createMemoryHistory(),
  //   history: createWebHashHistory(),
  routes,
});
