# Kunkun Extensions

This repository contains the full list of Kunkun extensions.

Please always use `pnpm` to develop an extension.

## Develop

```bash
# Run pnpm install and pnpm build for all extensions, to update pnpm lock file and build all extensions
bun ci/build-every-extension.ts
```

To develop a new extension, create it under `extensions`, make sure `pnpm install` and `pnpm build` work for the extension.

Run the following command to verify the extension:

```bash
npx @kksh/cli@latest verify
```
