# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim

# Render's native node build sandbox has a read-only filesystem, so apt is
# only possible inside a real Docker build. Install MariaDB here at build time;
# the server is initialized + seeded at boot by deploy/start.sh.
RUN echo '#!/bin/sh' > /usr/sbin/policy-rc.d \
 && echo 'exit 101' >> /usr/sbin/policy-rc.d \
 && chmod +x /usr/sbin/policy-rc.d \
 && apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      mariadb-server mariadb-client \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY backend/package.json backend/package-lock.json backend/
RUN cd backend && npm ci

COPY . .
RUN npm run build

EXPOSE 10000

CMD ["bash", "deploy/start.sh"]
