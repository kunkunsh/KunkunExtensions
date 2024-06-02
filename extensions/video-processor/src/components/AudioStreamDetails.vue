<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { AudioStream, VideoStream } from "@/lib/model";
import { computed, onMounted } from "vue";
import { Separator } from "./ui/separator";

const props = defineProps<{ stream: AudioStream }>();
const isVideo = computed(() => props.stream.codec_type === "video");
const isAudio = computed(() => props.stream.codec_type === "audio");
</script>
<template>
  <p class="flex justify-between">
    <span class="text-muted-foreground font-semibold">Stream Type</span>
    <span v-if="isVideo"><Badge>Video</Badge></span>
    <span v-if="isAudio"><Badge variant="secondary">Audio</Badge></span>
  </p>
  <p v-if="stream.duration" class="flex justify-between">
    <span class="text-muted-foreground font-semibold">Duration</span>
    <span>{{ parseInt(stream.duration) }}s</span>
  </p>
  <p v-if="stream.codec_long_name" class="flex justify-between">
    <span class="text-muted-foreground font-semibold">Encoding</span>
    <span>{{ stream.codec_long_name }}s</span>
  </p>
  <p v-if="stream.sample_rate" class="flex justify-between">
    <span class="text-muted-foreground font-semibold">Sampling Rate</span>
    <span>{{ stream.sample_rate }}</span>
  </p>
  <p v-if="stream.channels" class="flex justify-between">
    <span class="text-muted-foreground font-semibold">Channels</span>
    <span>{{ stream.channels }}</span>
  </p>
  <p v-if="stream.channel_layout" class="flex justify-between">
    <span class="text-muted-foreground font-semibold">Channel Layout</span>
    <span>{{ stream.channel_layout }}</span>
  </p>
  <p v-if="stream.bit_rate" class="flex justify-between">
    <span class="text-muted-foreground font-semibold">Bit Rate</span>
    <span>{{ stream.bit_rate }}bits</span>
  </p>
  <Separator class="my-2" />
</template>
