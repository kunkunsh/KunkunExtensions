# docker build . -t huakunshen/kunkun-ext-builder:latest --platform linux/amd64
FROM node:22.5.1-bullseye-slim
RUN corepack enable pnpm
# install bun and deno
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.1.30"
RUN curl -fsSL https://deno.land/install.sh | sh