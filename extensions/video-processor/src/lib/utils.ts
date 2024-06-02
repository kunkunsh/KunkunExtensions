import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { shell } from "jarvis-api/ui";

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
