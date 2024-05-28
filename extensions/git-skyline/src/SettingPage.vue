<script setup lang="ts">
import * as z from "zod";
import { onMounted, ref } from "vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { InfoIcon } from "lucide-vue-next";
import { window } from "jarvis-api/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppState } from "./lib/store";
import { router } from "./lib/router";

onMounted(() => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.destroyWindow();
    }
  });
});

const appState = useAppState();
function onSubmit(e: Event) {
  e.preventDefault();
}
const url = ref("");
function updateUrl() {
  const parse = z.string().url().safeParse(url.value);
  if (parse.error) {
    toast({
      title: "Fail to Set URL",
      description: parse.error.toString(),
      variant: "destructive",
    });
  } else {
    appState.setUrl(url.value);
    toast({
      title: "URL Set",
    });
    router.push("/");
  }
}
</script>

<template>
  <div
    class="h-screen flex items-center justify-center bg-background/50 rounded-lg"
    data-tauri-drag-region
  >
    <Card data-tauri-drag-region>
      <form @submit="onSubmit">
        <CardHeader>
          <CardTitle>Setting</CardTitle>
          <CardDescription>Set Your GitHub Username or Git Skyline iframe URL</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid items-center w-full gap-4">
            <div class="flex flex-col space-y-1.5">
              <Label for="url">Git Skyline URL</Label>
              <Input
                id="url"
                placeholder="Git Skyline URL"
                v-model="url"
                :default-value="appState.gitSkylineUrl"
              />
            </div>
            <div class="text-sm text-muted-foreground flex items-center space-x-2">
              Go To <Button class="px-1" variant="link">https://git-skyline.huakun.tech</Button> to
              Generate a URL
              <Popover>
                <PopoverTrigger><InfoIcon class="w-5 h-5" /></PopoverTrigger>
                <PopoverContent>
                  <span class="">
                    Go to
                    <Button class="px-1" variant="link">https://git-skyline.huakun.tech</Button>,
                    enter your Username. A 3D model will be generated. Click on
                    <strong>Embed Page</strong> button in the top right corner to generate a embed
                    URL, and paste it here.
                  </span>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div class="flex flex-col space-y-3 w-full">
            <Button @click="updateUrl" type="submit">Update</Button>
            <router-link to="/" class="w-full">
              <Button class="w-full">Go Back to Git Skyline</Button>
            </router-link>
          </div>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>
