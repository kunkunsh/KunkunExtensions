# docker build . -t huakunshen/kunkun-ext-builder:latest --platform linux/amd64
FROM node:20
RUN corepack enable pnpm
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.1.25"