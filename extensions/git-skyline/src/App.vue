<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import { onMounted } from "vue";
import { window } from "jarvis-api/ui";
import Toaster from "@/components/ui/toast/Toaster.vue";

useColorMode();

onMounted(() => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.destroyWindow();
    }
  });
  document.addEventListener("dblclick", () => {
    window.destroyWindow();
  });
});
</script>

<template>
  <Toaster />
  <RouterView />
</template>
