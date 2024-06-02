<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import Toaster from "@/components/ui/toast/Toaster.vue";
import { shell, getSelectedFilesInFileExplorer } from "jarvis-api/ui";
import {
  CalendarIcon,
  EnvelopeClosedIcon,
  FaceIcon,
  GearIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-icons/vue";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { onMounted, ref } from "vue";
import VideoDetail from "./components/VideoDetail.vue";
import { getFirstFrameOfVideo } from "./lib/utils";

useColorMode();

const selectedFiles = ref<string[]>([]);

onMounted(() => {
  getSelectedFilesInFileExplorer().then((files) => {
    selectedFiles.value = files;
    // return getFirstFrameOfVideo(files[0]);
  });
  // .then((data) => {
  //   console.log(data);
  // });
});

let selectedVideo = ref<string | undefined>();
</script>

<template>
  <Toaster />
  <main class="h-screen flex flex-col">
    <div class="h-8" data-tauri-drag-region />
    <Command class="grow rounded-lg shadow-md" v-model="selectedVideo">
      <CommandInput placeholder="Type a command or search..." class="" />
      <div class="grow flex">
        <CommandList class="w-64 max-h-full">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Videos">
            <CommandItem v-for="file in selectedFiles" :value="file">
              <CalendarIcon class="mr-2 h-4 w-4" />
              <span>{{ file.split("/").at(-1) }}</span>
            </CommandItem>
            <!-- <CommandItem v-for="i in 100" :value="i"></CommandItem> -->
          </CommandGroup>
        </CommandList>
        <VideoDetail v-if="selectedVideo" :selectedVideo="selectedVideo" />
      </div>
    </Command>
  </main>
</template>

<style>
.dark {
  color-scheme: dark;
}
</style>
