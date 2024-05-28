<script setup lang="ts">
import { onMounted, ref } from "vue";
import ContextMenu from "./components/context-menu.vue";
import { useAppState } from "./lib/store";
import { router } from "./lib/router";
import { window } from "jarvis-api/ui";
import { cn } from "@/lib/utils";
import Card from "./components/ui/card/Card.vue";

const appState = useAppState();
const showInstructions = ref(true);

onMounted(() => {
  if (!appState.gitSkylineUrl) {
    router.push("/setting");
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.destroyWindow();
    }
  });
  setTimeout(() => {
    showInstructions.value = false;
  }, 5000);
});
</script>
<template>
  <div class="h-screen w-full absolute z-0">
    <iframe :src="appState.gitSkylineUrl" width="100%" height="100%" frameBorder="0" class="grow" />
  </div>
  <div class="h-screen flex flex-col">
    <div :class="cn('h-32 z-50')" data-tauri-drag-region>
      <Card v-if="showInstructions" class="w-full h-full flex justify-center items-center">
        <h1 class="text-3xl z-0 select-none">
          Left Click and Drag this region to move this window
        </h1>
      </Card>
    </div>
    <div class="grow"></div>
    <div :class="cn('h-32 z-50')" data-tauri-drag-region>
      <Card v-if="showInstructions" class="w-full h-full flex flex-col justify-center items-center">
        <h1 class="text-3xl z-0 select-none">Right Click on This Region to Go To Settings</h1>
        <h1 class="text-3xl z-0 select-none">Press Escape To Close Window</h1>
        <ContextMenu />
      </Card>
    </div>
  </div>
</template>
