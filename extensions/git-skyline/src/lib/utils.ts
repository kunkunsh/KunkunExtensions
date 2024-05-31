import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function defaultGitSkylineUrl(githubUsername: string) {
  return `https://git-skyline.huakun.tech/contribution/github/${githubUsername}/embed?enableZoom=true&autoRotate=true`;
}
