<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { AudioStream, FFProbeSchema, VideoStream } from "@/lib/model";
import { cn, execute, getFFProbeVideoInfo, getFirstFrameOfVideo } from "@/lib/utils";
import { shell, getSelectedFilesInFileExplorer } from "jarvis-api/ui";
import VideoStreamDetails from "./VideoStreamDetails.vue";
import AudioStreamDetails from "./AudioStreamDetails.vue";
import { Separator } from "./ui/separator";
import { convertFileSrc } from "@tauri-apps/api/core";

const props = defineProps<{ selectedVideo: string }>();
const videoDetail = ref<FFProbeSchema>();
const videoPreviewPng = ref("");
const isPlaying = ref(false);

function refreshVideoInfo() {
  getFFProbeVideoInfo(props.selectedVideo).then((res) => {
    videoDetail.value = res;
  });
  getFirstFrameOfVideo(props.selectedVideo).then((res) => {
    videoPreviewPng.value = res;
  });
}

watch(
  () => props.selectedVideo,
  () => {
    refreshVideoInfo();
  },
);

onMounted(() => {
  refreshVideoInfo();
});
const videoStreams = computed(() =>
  videoDetail.value?.streams.filter((stream) => stream.codec_type === "video"),
);
const audioStreams = computed(() =>
  videoDetail.value?.streams.filter((stream) => stream.codec_type === "audio"),
);
</script>
<template>
  <div class="w-full p-2 px-4 flex flex-col space-y-1">
    <div class="flex justify-center">
      <video
        v-if="props.selectedVideo"
        :class="cn(isPlaying ? 'max-h-[90vh]' : 'max-h-44')"
        controls
        :src="convertFileSrc(props.selectedVideo)"
        @play="isPlaying = true"
        @pause="isPlaying = false"
      ></video>
    </div>
    <p v-if="videoDetail?.format.filename" class="flex justify-between">
      <span class="text-muted-foreground font-semibold">File Path</span>
      <span>{{ videoDetail?.format.filename }}</span>
    </p>
    <p v-if="videoDetail?.format.duration" class="flex justify-between">
      <span class="text-muted-foreground font-semibold">Duration</span>
      <span>{{ Math.round(parseFloat(videoDetail?.format.duration) * 1000) / 1000 }}s</span>
    </p>
    <Separator class="my-2" />
    <VideoStreamDetails v-for="stream in videoStreams" :stream="stream as VideoStream" />
    <AudioStreamDetails v-for="stream in audioStreams" :stream="stream as AudioStream" />
  </div>
</template>
