<script setup lang="ts">
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { router } from "@/lib/router";
import { window } from "jarvis-api/ui";

const props = defineProps<{ class?: HTMLAttributes["class"]; showInstructions: boolean }>();
function selectSetting() {
  router.push({ path: "/setting" });
}

function close() {
  window.closeWindow();
}
</script>

<template>
  <ContextMenu :class="cn(props.class, '')" data-tauri-drag-region>
    <ContextMenuTrigger class="w-full h-full">
      <div :class="cn('h-full w-full', showInstructions ? 'border border-red-400' : '')">
        <div v-if="showInstructions" class="flex flex-col h-full w-full justify-center items-center">
          <h1 class="text-3xl z-0 select-none">Right Click on This Region to Go To Settings</h1>
          <h1 class="text-3xl z-0 select-none">Press Escape To Close Window</h1>
        </div>
      </div>
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem @select="selectSetting"> Setting </ContextMenuItem>
      <ContextMenuItem @select="close"> Close </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
