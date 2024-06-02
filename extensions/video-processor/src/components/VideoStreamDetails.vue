<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { AudioStream, VideoStream } from "@/lib/model";
import { Separator } from "./ui/separator";
import { computed } from "vue";

const props = defineProps<{ stream: VideoStream }>();
const isVideo = computed(() => props.stream.codec_type === "video");
const isAudio = computed(() => props.stream.codec_type === "audio");

/**
 *
 * @param frameRateStr e.g. 24000/1001
 */
function computeFrameRate(frameRateStr: string) {
  const [a, b] = frameRateStr.split("/");
  return Math.round((parseInt(a) / parseInt(b)) * 10000) / 10000;
}
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
    <span>{{ stream.codec_long_name }}</span>
  </p>
  <p v-if="stream.width && stream.height" class="flex justify-between">
    <span class="text-muted-foreground font-semibold">Resolution</span>
    <span>{{ stream.width }}x{{ stream.height }}</span>
  </p>
  <p v-if="stream.color_space" class="flex justify-between">
    <span class="text-muted-foreground font-semibold">Color Space</span>
    <span>{{ stream.color_space }}</span>
  </p>
  <p v-if="stream.display_aspect_ratio" class="flex justify-between">
    <span class="text-muted-foreground font-semibold">Display Aspect Ratio</span>
    <span>{{ stream.display_aspect_ratio }}</span>
  </p>
  <p v-if="stream.avg_frame_rate" class="flex justify-between">
    <span class="text-muted-foreground font-semibold">Average Frame Rate</span>
    <span>{{ computeFrameRate(stream.avg_frame_rate) }}</span>
  </p>
  <p v-if="stream.bits_per_raw_sample" class="flex justify-between">
    <span class="text-muted-foreground font-semibold">Bits Per Raw Sample</span>
    <span>{{ stream.bits_per_raw_sample }}</span>
  </p>
  <p v-if="stream.bit_rate" class="flex justify-between">
    <span class="text-muted-foreground font-semibold">Bit Rate</span>
    <span>{{ parseInt(stream.bit_rate) / 1000 }} kb/s</span>
  </p>
  <Separator class="my-2" />
</template>
