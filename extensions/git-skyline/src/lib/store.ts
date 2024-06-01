import { defineStore } from "pinia";

export const useAppState = defineStore("jarvisExtGitSkylineAppState", {
  state: (): { gitSkylineUrl: string | undefined; settingOpen: boolean } => ({
    gitSkylineUrl: undefined,
    settingOpen: false,
  }),
  getters: {},
  actions: {
    setUrl(url: string) {
      this.gitSkylineUrl = url;
    },
    setSettingOpen(open: boolean) {
      this.settingOpen = open;
    },
  },
});
