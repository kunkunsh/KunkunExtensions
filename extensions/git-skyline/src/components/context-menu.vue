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

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
function selectSetting() {
  console.log("setting");
  router.push({ path: "/setting" });
}
</script>

<template>
  <ContextMenu :class="cn(props.class, '')" data-tauri-drag-region>
    <ContextMenuTrigger class="">
      <div class="h-full w-full"></div>
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem @select="selectSetting">
        Setting
        <!-- <SettingDialog /> -->
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
