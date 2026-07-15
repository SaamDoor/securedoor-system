# Lightweight runtime image; app is prebuilt into ./liara-release
# node_modules is uploaded as modules.tgz because Liara strips node_modules folders
# Use Iran Docker mirror so build.location=iran works
FROM registry.docker.ir/library/node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY liara-release/ ./
RUN tar -xzf modules.tgz && rm modules.tgz

EXPOSE 3000
CMD ["node", "server.js"]
