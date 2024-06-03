import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { shell } from "jarvis-api/ui";
import { AudioStream, FFProbeSchema, VideoStream } from "./model";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function execute(
  command: shell.Command<string>,
): Promise<{ stderr: string; stdout: string }> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    command.on("close", (data) => {
      // console.log(`command finished with code ${data.code} and signal ${data.signal}`);
      return resolve({ stdout, stderr });
    });
    command.on("error", (error) => reject(error));
    command.stdout.on("data", (line) => {
      stdout += line;
    });
    command.stderr.on("data", (line) => {
      stderr += line;
    });
    command.spawn();
  });
}

export function getFFProbeVideoInfo(videoPath: string) {
  const command = shell.Command.create("ffprobe", [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    videoPath,
  ]);
  return execute(command).then(({ stdout, stderr }) => {
    console.log(stdout);
    console.log(stderr);

    const json = JSON.parse(stdout);
    const parseRes = FFProbeSchema.safeParse(json);
    if (parseRes.success) {
      // console.log("parseRes.data", parseRes.data);
      parseRes.data.streams.forEach((stream, idx) => {
        if (stream.codec_type === "video") {
          parseRes.data.streams[idx] = VideoStream.parse(json.streams[idx]);
        }
        if (stream.codec_type === "audio") {
          parseRes.data.streams[idx] = AudioStream.parse(json.streams[idx]);
        }
      });
      return parseRes.data;
    }
    return Promise.reject(parseRes.error.toString());
  });
}

// ffmpeg -i ./kxzp.mp4 -vf "select=eq(n\,0)" -vframes 1 -f image2pipe - | base64
export function getFirstFrameOfVideo(videoPath: string) {
  // const options =
  //   '-i /Users/hacker/Desktop/kxzp.mp4 -vf "select=eq(n,0)" -vframes 1 /Users/hacker/Desktop/first-frame.png';
  // const args = quote(options);
  // const args = options.split(" ");
  // const args = shlex.split(options);
  // console.log(args);

  // const command = shell.Command.create("ffmpeg", [
  // "-i",
  // videoPath,
  // "-vf",
  // `"select=eq(n\\,0)"`,
  // "-vframes",
  // "1 /Users/hacker/Desktop/first-frame.png",
  // "-f",
  // "image2pipe",
  // "",
  // "-",
  // "|",
  // "base64",
  // ]);
  // const args = `-i /Users/hacker/Desktop/kxzp.mp4 -vf "select=eq(n\,0)" -vframes 1 /Users/hacker/Desktop/first-frame.png`;
  const command = shell.Command.create("bash", [
    "/Users/hacker/Dev/projects/Jarvis/vendors/extensions/extensions/video-processor/scripts/get-first-frame.sh",
  ]);
  // const command = shell.Command.create("ffmpeg", [`-vf "select=eq(n\,0)" -vframes 1 -f image2pipe - | base64`])

  return execute(command).then((output) => {
    return output.stdout;
  });
}
