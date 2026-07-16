# Prebuilt Next.js standalone for Liara Docker
# modules.tgz / next-build.tgz: Liara often strips node_modules and .next from uploads
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY liara-release/ ./
RUN tar -xzf modules.tgz && rm -f modules.tgz \
  && tar -xzf next-build.tgz && rm -f next-build.tgz

EXPOSE 3000
# Explicit binary — do not rely on npm start
CMD ["node", "server.js"]
