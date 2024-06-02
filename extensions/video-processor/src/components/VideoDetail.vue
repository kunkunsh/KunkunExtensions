<script setup lang="ts">
import { onMounted, ref } from "vue";
import { FfprobeSchema } from "@/lib/model";
import { execute } from "@/lib/utils";
import { shell, getSelectedFilesInFileExplorer } from "jarvis-api/ui";

onMounted(async () => {
  let result = await shell.Command.create("exec-sh", ["-c", "echo 'Hello World!'"]).execute();
  console.log("result", result);
  console.log("stdout", result.stdout);
  console.log("stderr", result.stderr);

  //   getSelectedFilesInFileExplorer().then(async (files) => {
  //     selectedFilePaths.value = files;
  //     console.log(files);

  //     // const command = shell.Command.create("ffprobe");
  //     const command = shell.Command.create("ffprobe", [
  //       "-v",
  //       "quiet",
  //       "-print_format",
  //       "json",
  //       "-show_format",
  //       "-show_streams",
  //       files[0],
  //     ]);
  //     const res = await execute(command);
  //     console.log(FfprobeSchema.parse(JSON.parse(res.stdout)));
  //   });
});
</script>
<template></template>
